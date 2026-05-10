import { ICommand } from '@nestjs/cqrs';

export class MoveFolderCommand implements ICommand {
  constructor(
    public readonly folderId: string,
    public readonly newParentFolderId: string | null,
    public readonly ownerId: string,
  ) {}
}
