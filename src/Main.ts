import cors from "@elysiajs/cors";
import Elysia from "elysia";
import SheetsEndpoint from "./rest/SheetsEndpoint";
import { SheetSchema } from "./db/Database";

await SheetSchema.load();

process.on("SIGINT", async () => {
  await SheetSchema.save();
  process.exit();
});

new Elysia()
  .get("/", () => "Hello World!")
  .get("/sheets", () => SheetsEndpoint.listSheets())
  .get("/sheets/new", () => SheetsEndpoint.newSheet())
  .get("/sheets/:id", ({ params: { id } }) => SheetsEndpoint.getSheet(id))
  .use(cors())
  .listen(process.env.PORT);
