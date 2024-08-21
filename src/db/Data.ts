import { Emitter, createEvent } from "../lib/Event.ts";
import { getMetadata, type AnyFunction } from "../lib/Metadata.ts";
import {
  isConstructor,
  isPrimitive,
  type Constructor,
  type Primitive,
} from "../Util.ts";

export const InitializeObjectEvent = createEvent("InitializeObjectEvent");

export interface Serializer<V> {
  serialize: (value: V) => any;
  deserialize: (raw: any) => V;
}

export function isSerializer<V>(obj: any): obj is Serializer<V> {
  return (
    typeof obj?.serialize === "function" &&
    typeof obj?.deserialize === "function"
  );
}

export function Property<T extends NonNullable<unknown>>(
  type?: Constructor<T> | Serializer<T> | TypeMap<T>,
): PropertyDecorator;
export function Property(target: object, name: string | symbol): void;
export function Property<T extends NonNullable<unknown>>(
  typeOrTarget?: object | Constructor<T> | Serializer<T> | TypeMap<T>,
  name?: string | symbol,
): PropertyDecorator | void {
  let serializer: Serializer<T>;
  switch (true) {
    case typeOrTarget === undefined:
      serializer = DefaultSerializer;
      break;
    case isSerializer<T>(typeOrTarget):
      serializer = typeOrTarget;
      break;
    case isConstructor<T>(typeOrTarget):
      serializer = new ClassSerializer(typeOrTarget);
      break;
    case isTypeMap<T>(typeOrTarget):
      serializer = new SubclassSerializer<T>(typeOrTarget);
      break;
    default:
      getMetadata(typeOrTarget).propertyData[name ?? ""] = DefaultSerializer;
      return;
  }

  return (target: object, name: string | symbol) => {
    getMetadata(target).propertyData[name] = serializer;
  };
}

export class TypeMap<T extends object> {
  private readonly map: Record<string, Constructor<T>[]> = {};

  constructor(...ctors: Constructor<T>[]) {
    ctors.forEach(this.add, this);
  }

  add(ctor: Constructor<T>) {
    if (!this.map[ctor.name]) this.map[ctor.name] = [];
    const ctors = this.map[ctor.name];
    if (!ctors.includes(ctor)) ctors.push(ctor);
  }

  hash(ctor?: Constructor): string | undefined {
    const ctors = this.map[ctor?.name ?? ""];
    if (!ctors) return undefined;
    const index = ctors.findIndex((i) => i == ctor);
    return ctor?.name + (ctors.length <= 1 ? "" : `@${index + 1}`);
  }

  get(hash: string): Constructor<T> {
    const [name, index] = hash.split("@");
    return this.map[name][typeof index === "number" ? parseInt(index) - 1 : 0];
  }

  values() {
    return Object.values(this.map).flat();
  }
}

export function isTypeMap<T extends object>(obj: any): obj is TypeMap<T> {
  return obj?.constructor === TypeMap;
}

export function Register<T extends object>(typeMap: TypeMap<T>) {
  return (ctor: Constructor<T>) => typeMap.add(ctor);
}

export type SerializableType = Primitive | any[] | object;
export function serialize(value: AnyFunction): undefined;
export function serialize(value: SerializableType): any;
export function serialize<V extends SerializableType>(value: V): any {
  if (typeof value === "function") return undefined; // don't even bother serializing functions
  if (isPrimitive(value)) return value;
  if (Array.isArray(value)) return value.map(serialize);

  const properties = getMetadata(value, false)?.propertyData;
  if (!properties) return { ...value }; // TODO: treat as struct and serialize recursively
  const res: Record<string, any> = {};

  for (const [k, v] of Object.entries(value)) {
    if (v === undefined) continue; // excludes undefined, but includes null

    const serializer = properties[k];
    if (serializer === undefined) continue;
    res[k] = Array.isArray(v)
      ? v.map(serializer.serialize, serializer)
      : serializer.serialize(v);
  }

  return res;
}

export function deserialize<D>(data: D): D;
export function deserialize<T extends object>(
  data: any,
  ctor?: Constructor<T>,
): T;
export function deserialize<T extends object>(
  data: any,
  ctor?: Constructor<T>,
): T {
  if (ctor === undefined) return data;

  const res = new ctor();
  const properties = getMetadata(res).propertyData;
  for (const [k, v] of Object.entries(data)) {
    const serializer = properties[k];
    Reflect.set(
      res,
      k,
      serializer === undefined
        ? v
        : Array.isArray(v)
          ? v.map(serializer.deserialize, serializer)
          : serializer.deserialize(v),
    );
  }

  const emitter = new Emitter();
  emitter.addListener(res);
  emitter.call(InitializeObjectEvent);

  return res;
}

export const DefaultSerializer = {
  serialize,
  deserialize,
};

export class ClassSerializer<T extends object> implements Serializer<T> {
  constructor(private readonly ctor: Constructor<T>) {}

  serialize(obj: T): any {
    return serialize(obj);
  }

  deserialize(obj: any): T {
    return deserialize(obj, this.ctor);
  }
}

export class SubclassSerializer<T extends object> implements Serializer<T> {
  private typeMap: TypeMap<T>;

  constructor(ctors: Constructor<T>[] | TypeMap<T>) {
    if (isTypeMap(ctors)) {
      this.typeMap = ctors;
    } else {
      this.typeMap = new TypeMap<T>();
      ctors.forEach(this.typeMap.add, this.typeMap);
    }
  }

  serialize(obj: T): any {
    const res = serialize(obj);
    Reflect.set(res, "$id", this.typeMap.hash(obj.constructor as Constructor));
    return res;
  }

  deserialize(obj: any): T {
    const id: string = Reflect.get(obj, "$id");
    if (!id) throw new Error("Missing Id Deserializing Subclass");
    Reflect.deleteProperty(obj, "$id");
    return deserialize(obj, this.typeMap.get(id));
  }
}
