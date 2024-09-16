import { SheetSchema } from "../Database";
import SheetsEndpoint from "../endpoints/SheetsEndpoint";
import type { Environment } from "../Server";
import { GroupCommand, type CliCommand } from "./Cli";

export class SheetCommand extends GroupCommand {
  constructor() {
    super("sheet");

    this.add(new ListSubcommand());
    this.add(new NewSubcommand());
  }
}

class ListSubcommand implements CliCommand {
  readonly label = "list";

  execute({ out }: Environment, ..._: string[]) {
    for (const [id, _] of Object.entries(SheetSchema.data)) {
      out.write(`${id}\n`);
    }
  }
}

class NewSubcommand implements CliCommand {
  readonly label = "new";

  execute({ out }: Environment) {
    out.write(
      `Created new sheet: ${JSON.stringify(SheetsEndpoint.newSheet())}\n`,
    );
  }
}
