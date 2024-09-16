import { CLI, type CliCommand } from "./Cli";

export interface ExitCommandProps {
  readonly cli: CLI;
  readonly app: any;
}

export class ExitCommand implements CliCommand {
  readonly label = "exit";

  constructor(
    private cli: CLI,
    private app: any,
  ) {}

  execute(): void {
    this.app.stop();
    this.cli.stop();
  }
}
