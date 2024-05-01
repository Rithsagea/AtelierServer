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
