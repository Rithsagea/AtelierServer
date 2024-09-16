import { TypeMap } from "../lib/Data";

export abstract class Class {
  abstract features: Feature[];
}

export const Classes = new TypeMap<Class>();

export abstract class Feature {}
