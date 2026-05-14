import { ICommand } from '@nestjs/cqrs';

export class ChangeFileVisibilityCommand implements ICommand {
  constructor(
    public readonly fileId: string,
    public readonly isPublic: boolean,
    public readonly ownerId: string,
  ) {}
}
