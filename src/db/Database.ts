import { Sheet } from "../dnd/Sheet";
import { ClassSerializer, type Serializer } from "./Data";

export class Schema<V> {
  public data: Record<string, V> = {};
  public readonly path: string;
  public readonly serializer: Serializer<V>;

  constructor(path: string, serializer: Serializer<V>) {
    this.path = path;
    this.serializer = serializer;
  }

  async load() {
    const file = Bun.file(this.path);
    const raw = (await file.exists()) ? await file.json() : [];

    this.data = Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, this.serializer.deserialize(v)]),
    );
  }

  async save() {
    const raw = Object.fromEntries(
      Object.entries(this.data).map(([k, v]) => [
        k,
        this.serializer.serialize(v),
      ]),
    );

    const file = Bun.file(this.path);
    const writer = file.writer();
    writer.write(JSON.stringify(raw));
    await writer.flush();
  }
}

export const SheetSchema = new Schema<Sheet>(
  "./data/sheets.json",
  new ClassSerializer(Sheet),
);
