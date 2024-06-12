import type { Serializer } from "../db/Data";
import type { Event } from "./Event";

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
  target: Function,
  generate: false,
): MethodMetadata | undefined;
export function getMetadata(
  target: object,
  generate: false,
): ObjectMetadata | undefined;
export function getMetadata(
  target: Function,
  generate?: boolean,
): MethodMetadata;
export function getMetadata(target: object, generate?: boolean): ObjectMetadata;
export function getMetadata(
  target: any,
  generate: boolean = true,
): ObjectMetadata | MethodMetadata | undefined {
  if (!target.$metadata && generate) {
    target.$metadata =
      typeof target === "function"
        ? initMethodMetadata()
        : initObjectMetadata();
  }
  return target.$metadata;
}
