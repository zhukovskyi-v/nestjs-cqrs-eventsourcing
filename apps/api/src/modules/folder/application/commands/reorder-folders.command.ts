import { ICommand } from '@nestjs/cqrs';

export class ReorderFoldersCommand implements ICommand {
  constructor(
    public readonly ownerId: string,
    public readonly parentFolderId: string | null,
    public readonly orderedIds: string[],
  ) {}
}
