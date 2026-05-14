import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ORPCError } from '@orpc/nest';
import { RenameFileCommand } from '../rename-file.command';
import { FileRepository } from '../../../infrastructure/repositories/file.repository';

@CommandHandler(RenameFileCommand)
export class RenameFileHandler implements ICommandHandler<RenameFileCommand> {
  constructor(private readonly fileRepository: FileRepository) {}

  async execute(command: RenameFileCommand): Promise<void> {
    const file = await this.fileRepository.findById(command.fileId);
    if (!file || file.getOwnerId() !== command.ownerId) {
      throw new ORPCError('NOT_FOUND', {
        message: `File ${command.fileId} not found`,
      });
    }
    file.rename(command.newName);
    await this.fileRepository.save(file);
  }
}
