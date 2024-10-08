import type { Serializer } from "./Data";
import type { Event } from "./Event";

export type AnyFunction = (...args: any[]) => any;

export interface ObjectMetadata {
  id?: string;
  propertyData: Record<string | symbol, Serializer<any>>;
}

function initObjectMetadata(): ObjectMetadata {
  return {
    propertyData: {},
  };
}

export interface MethodMetadata {
  event?: Event;
  priority?: number;
}

function initMethodMetadata(): MethodMetadata {
  return {};
}

export function getMetadata(
  target: AnyFunction,
  generate: false,
): MethodMetadata | undefined;
export function getMetadata(
  target: object,
  generate: false,
): ObjectMetadata | undefined;
export function getMetadata(
  target: AnyFunction,
  generate?: boolean,
): MethodMetadata;
export function getMetadata(target: object, generate?: boolean): ObjectMetadata;
export function getMetadata(
  target: any,
  generate: boolean = true,
): ObjectMetadata | MethodMetadata | undefined {
  if (typeof target === "function") {
    if (!target.$metadata && generate) {
      target.$metadata = initMethodMetadata();
    }
    return target.$metadata;
  } else {
    if (!target.constructor.$metadata && generate) {
      target.constructor.$metadata = initObjectMetadata();
    }
    return target.constructor.$metadata;
  }
}
