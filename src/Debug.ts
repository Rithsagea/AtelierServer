import { SheetSchema } from "./db/Database";

await SheetSchema.load();

console.log(SheetSchema.data);

await SheetSchema.save();
