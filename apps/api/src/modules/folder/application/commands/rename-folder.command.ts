import { ICommand } from '@nestjs/cqrs';

export class RenameFolderCommand implements ICommand {
  constructor(
    public readonly folderId: string,
    public readonly newName: string,
    public readonly ownerId: string,
  ) {}
}
