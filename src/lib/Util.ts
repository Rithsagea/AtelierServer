import { Glob } from "bun";

export function enumMap<K extends string, V>(
  keys: readonly K[],
  fn: (key: K) => V,
): Record<K, V> {
  return keys.reduce(
    (res, key) => ({ ...res, [key]: fn(key) }),
    {} as Record<K, V>,
  );
}

export function sanitize(val: any) {
  return Object.fromEntries(
    Object.entries(val).filter(([_, v]) => typeof v !== "function"),
  );
}

export function getMethodLabels(obj: object) {
  const labels = new Set<string>();
  for (
    let proto = Object.getPrototypeOf(obj);
    proto;
    proto = Object.getPrototypeOf(proto)
  ) {
    for (const label of Object.getOwnPropertyNames(proto)) {
      labels.add(label);
    }
  }

  return [...labels].filter(
    (label) => typeof Reflect.get(obj, label) === "function",
  );
}

export type Primitive =
  | bigint
  | boolean
  | null
  | number
  | string
  | symbol
  | undefined;

export function isPrimitive(val: any): val is Primitive {
  return val !== Object(val);
}

export type Constructor<T extends object = object> = new () => T;

export function isConstructor<T extends object>(
  obj: any,
): obj is Constructor<T> {
  return typeof obj === "function" && "prototype" in obj;
}

export function applyMixins(
  derivedCtor: any,
  constructors: Constructor<any>[],
) {
  for (const ctor of constructors) {
    for (const name of Object.getOwnPropertyNames(ctor.prototype)) {
      if (name !== "constructor") {
        Object.defineProperty(
          derivedCtor.prototype,
          name,
          Object.getOwnPropertyDescriptor(ctor.prototype, name) ||
            Object.create(null),
        );
      }
    }
  }

  derivedCtor.$metadata = {
    id: derivedCtor.$metadata.id,
    propertyData: {
      ...derivedCtor.$metadata.propertyData,
      ...Object.fromEntries(
        constructors
          .flatMap((ctor: any) => ctor.$metadata.propertyData)
          .flatMap(Object.entries),
      ),
    },
  };
}

export async function loadContent() {
  const prefix = "/../../content";
  const files = (
    await Array.fromAsync(new Glob("**/*.ts").scan(import.meta.dir + prefix))
  ).filter((file) => !file.includes(".test"));
  files.forEach((file) => console.log(`Loading: ${file}`));
  files.map((file) => `./${prefix}/${file}`).forEach((file) => require(file));
}
