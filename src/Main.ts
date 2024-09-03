import cors from "@elysiajs/cors";
import Elysia from "elysia";
import SheetsEndpoint from "./endpoints/SheetsEndpoint";
import { SheetSchema } from "./db/Database";
import { WebsocketEndpoint } from "./websocket/Websocket";
import { CLI } from "./cli/Cli";
import { ExitCommand } from "./cli/ExitCommand";
import { SheetCommand } from "./cli/SheetCommand";

await SheetSchema.load();

process.on("SIGINT", async () => {
  await SheetSchema.save();
  process.exit();
});

const app = new Elysia()
  .get("/", () => "Hello World!")
  .get("/sheets", () => SheetsEndpoint.listSheets())
  .get("/sheets/new", () => SheetsEndpoint.newSheet())
  .get("/sheets/:id", ({ params: { id } }) => SheetsEndpoint.getSheet(id))
  .use(WebsocketEndpoint)
  .use(cors());

const env = {
  out: process.stdout,
  in: process.stdin,
};
export type Environment = typeof env;

const cli = new CLI(env);
cli.with(new ExitCommand(cli, app));
cli.with(new SheetCommand());

cli.listen();
app.listen(process.env.PORT);
