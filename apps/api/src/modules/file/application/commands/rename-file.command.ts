import { ICommand } from '@nestjs/cqrs';

export class RenameFileCommand implements ICommand {
  constructor(
    public readonly fileId: string,
    public readonly newName: string,
    public readonly ownerId: string,
  ) {}
}
