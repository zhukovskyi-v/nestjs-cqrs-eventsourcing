import { ICommand } from '@nestjs/cqrs';

export class MoveFileCommand implements ICommand {
  constructor(
    public readonly fileId: string,
    public readonly newFolderId: string | null,
    public readonly ownerId: string,
  ) {}
}
