import { getMethodLabels } from "../Util";
import { getMetadata, type AnyFunction } from "./Metadata";

export interface Event<_ = any> {
  id: string;
  name?: string;
}

export function createEvent<D = undefined>(name?: string): Event<D> {
  return { id: crypto.randomUUID(), name };
}

export interface SubscribedFunction<D> extends PropertyDescriptor {
  value?: (data: D) => void;
}

export function Subscribe<D>(event: Event<D>, priority: number = 0) {
  return (target: any, key: string, _: SubscribedFunction<D>) => {
    const metadata = getMetadata(Reflect.get(target, key) as AnyFunction);
    metadata.event = event;
    metadata.priority = priority;
  };
}

type Method<E extends Event> =
  E extends Event<infer R> ? (data: R) => void : never;

export interface Handler<E extends Event> {
  readonly listener?: object;
  readonly method: Method<E>;
  readonly priority: number;
}

export class Emitter {
  private handlers: Record<string, Handler<any>[]> = {};

  addHandler<E extends Event>(event: E, handler: Handler<E>) {
    const id = event.id;
    if (!this.handlers[id]) this.handlers[id] = [];
    this.handlers[id].push(handler);
    // TODO red black tree here
    this.handlers[id].sort((a, b) => b.priority - a.priority);
  }

  removeHandler<E extends Event>(event: E, handler: Handler<E>) {
    const handlers = this.handlers[event.id];
    if (!handlers) return false;
    this.handlers[event.id] = handlers.filter((h) => h != handler);
    return handlers.length !== this.handlers[event.id].length;
  }

  removeMethod<E extends Event>(event: E, method: Method<E>) {
    return (
      this.handlers[event.id]
        ?.filter((h) => h.method == method)
        .map((h) => this.removeHandler(event, h))
        .reduce((acc, val) => acc || val, false) ?? false
    );
  }

  addListener(listener: object) {
    for (const label of getMethodLabels(listener)) {
      if (label === "constructor") continue;
      const method: Method<any> = Reflect.get(listener, label);
      const metadata = getMetadata(method, false);
      if (!metadata) continue;

      this.addHandler(metadata.event!, {
        listener,
        method,
        priority: metadata.priority!,
      });
    }
  }

  addListeners(...listeners: object[]) {
    listeners.forEach(this.addListener, this);
  }

  removeListener(listener: object) {
    for (const label of getMethodLabels(listener)) {
      // TODO verify that constructed objects can't have a property with this name
      if (label === "constructor") continue;
      const method: Method<any> = Reflect.get(listener, label);
      const metadata = getMetadata(method, false);
      if (!metadata) continue;
      this.removeMethod(metadata.event!, method);
    }
  }

  call<E extends Event<D>, D>(event: E, data?: D) {
    this.handlers[event.id]?.forEach((handler) =>
      handler.method.call(handler.listener, data),
    );
  }
}

const emitter = new Emitter();
export function call<E extends Event<D>, D>(
  listener: object,
  event: E,
  data?: D,
) {
  emitter.addListener(listener);
  emitter.call(event, data);
  emitter.removeListener(listener);
}
