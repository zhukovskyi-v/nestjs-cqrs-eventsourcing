import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ORPCError } from '@orpc/nest';
import { ChangeFileVisibilityCommand } from '../change-file-visibility.command';
import { FileRepository } from '../../../infrastructure/repositories/file.repository';

@CommandHandler(ChangeFileVisibilityCommand)
export class ChangeFileVisibilityHandler implements ICommandHandler<ChangeFileVisibilityCommand> {
  constructor(private readonly fileRepository: FileRepository) {}

  async execute(command: ChangeFileVisibilityCommand): Promise<void> {
    const file = await this.fileRepository.findById(command.fileId);
    if (!file || file.getOwnerId() !== command.ownerId) {
      throw new ORPCError('NOT_FOUND', {
        message: `File ${command.fileId} not found`,
      });
    }
    file.changeVisibility(command.isPublic);
    await this.fileRepository.save(file);
  }
}
