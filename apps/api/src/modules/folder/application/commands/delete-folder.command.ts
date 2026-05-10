import { ICommand } from '@nestjs/cqrs';

export class DeleteFolderCommand implements ICommand {
  constructor(
    public readonly folderId: string,
    public readonly ownerId: string,
  ) {}
}
