import cors from "@elysiajs/cors";
import Elysia from "elysia";
import SheetsEndpoint from "./endpoints/SheetsEndpoint";
import { SheetSchema } from "./db/Database";
import { WebsocketEndpoint } from "./websocket/Websocket";

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
  .use(WebsocketEndpoint)
  .use(cors())
  .listen(process.env.PORT);
