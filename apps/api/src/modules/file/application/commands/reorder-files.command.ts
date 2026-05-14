import { ICommand } from '@nestjs/cqrs';

export class ReorderFilesCommand implements ICommand {
  constructor(
    public readonly ownerId: string,
    public readonly folderId: string | null,
    public readonly orderedIds: string[],
  ) {}
}
