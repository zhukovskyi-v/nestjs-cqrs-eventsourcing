import { Command } from '@nestjs/cqrs';

export class CreateFolderCommand extends Command<string> {
  constructor(
    public readonly name: string,
    public readonly ownerId: string,
    public readonly parentFolderId: string | null,
  ) {
    super();
  }
}
