import { Command } from '@nestjs/cqrs';

export class CloneFolderCommand extends Command<string> {
  constructor(
    public readonly sourceId: string,
    public readonly ownerId: string,
  ) {
    super();
  }
}
