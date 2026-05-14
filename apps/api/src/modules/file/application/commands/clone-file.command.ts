import { Command } from '@nestjs/cqrs';

export class CloneFileCommand extends Command<string> {
  constructor(
    public readonly sourceId: string,
    public readonly userId: string,
  ) {
    super();
  }
}
