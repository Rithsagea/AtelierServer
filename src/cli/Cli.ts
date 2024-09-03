import type { Environment } from "../Main";

export class CLI {
  private readonly env: Environment;
  private readonly output: NodeJS.WriteStream;
  private readonly input: NodeJS.ReadStream;
  private readonly handlers: Record<string, CliCommand> = {};
  private running: boolean;

  constructor(env: Environment) {
    this.env = env;
    this.output = env.out;
    this.input = env.in;
    this.running = false;
  }

  with(command: CliCommand) {
    this.handlers[command.label] = command;
    return this;
  }

  async listen() {
    this.running = true;
    this.output.write(`> `);
    for await (const line of this.input) {
      const args = (line as Buffer)
        .toString()
        .split(" ")
        .map((s) => s.trim());
      if (this.handlers[args[0]]) {
        this.handlers[args[0]].execute(this.env, ...args);
      } else {
        this.output.write(`Unknown command: ${args[0]}\n`);
      }
      if (!this.running) break;
      this.output.write(`> `);
    }
  }

  stop() {
    this.running = false;
  }
}

export interface CliCommand {
  readonly label: string;
  execute: (env: Environment, ...args: string[]) => void;
}

export class GroupCommand implements CliCommand {
  private subcommands: Record<string, CliCommand> = {};

  constructor(readonly label: string) { }

  execute(env: Environment, ...args: string[]) {
    const command = this.subcommands[args[1]];

    if (command) {
      command.execute(env, ...args.slice(1));
    } else {
      env.out.write(`Unknown subcommand: ${args[1]}\n`);
    }
  }

  protected add(subcommand: CliCommand) {
    this.subcommands[subcommand.label] = subcommand;
  }
}
