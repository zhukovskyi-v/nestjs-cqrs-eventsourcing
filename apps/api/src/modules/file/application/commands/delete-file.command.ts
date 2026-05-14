import { ICommand } from '@nestjs/cqrs';

export class DeleteFileCommand implements ICommand {
  constructor(
    public readonly fileId: string,
    public readonly ownerId: string,
  ) {}
}
