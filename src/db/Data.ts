export interface Serializer<V> {
  serialize: (value: V) => any;
  deserialize: (raw: any) => V;
}
