import { CLI, type CliCommand } from "./Cli";

export interface ExitCommandProps {
  readonly cli: CLI;
  readonly app: any;
}

export function ExitCommand({ cli, app }: ExitCommandProps): CliCommand {
  return () => {
    app.stop();
    cli.stop();
  };
}
