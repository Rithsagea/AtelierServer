export type Serializer<V> = {
  serialize: (value: V) => any;
  deserialize: (raw: any) => V;
};
