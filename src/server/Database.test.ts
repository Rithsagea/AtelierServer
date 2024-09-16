import type { Serializer } from "../lib/Data";
import { test, expect, spyOn } from "bun:test";
import { Schema } from "./Database";

const serializer: Serializer<string> = {
  serialize: (i) => i,
  deserialize: (i) => i,
};

test("database to save and load strings properly", async () => {
  const serializeSpy = spyOn(serializer, "serialize");
  const deserializeSpy = spyOn(serializer, "deserialize");

  const schema = new Schema("./test/test.json", serializer);
  schema.data["a"] = "foo";
  schema.data["b"] = "bar";
  schema.data["c"] = "baz";

  await schema.save();
  const data = schema.data;

  await schema.load();

  expect(data != schema.data);
  expect(data === schema.data);

  expect(serializeSpy.mock.calls).toEqual([["foo"], ["bar"], ["baz"]]);
  expect(deserializeSpy.mock.calls).toEqual([["foo"], ["bar"], ["baz"]]);
});
