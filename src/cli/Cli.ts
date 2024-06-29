export class CLI {
  private readonly output: NodeJS.WriteStream;
  private readonly input: NodeJS.ReadStream;
  private readonly handlers: Record<string, CliCommand> = {};
  private running: boolean;

  constructor(output: NodeJS.WriteStream, input: NodeJS.ReadStream) {
    this.output = output;
    this.input = input;
    this.running = false;
  }

  with(label: string, handler: CliCommand) {
    this.handlers[label] = handler;
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
      if (args[0] && this.handlers[args[0]]) {
        this.handlers[args[0]](args[0]);
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

export type CliCommand = (...args: string[]) => void;
