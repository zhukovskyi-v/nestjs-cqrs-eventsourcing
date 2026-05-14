import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ORPCError } from '@orpc/nest';
import { DeleteFileCommand } from '../delete-file.command';
import { FileRepository } from '../../../infrastructure/repositories/file.repository';

@CommandHandler(DeleteFileCommand)
export class DeleteFileHandler implements ICommandHandler<DeleteFileCommand> {
  constructor(private readonly fileRepository: FileRepository) {}

  async execute(command: DeleteFileCommand): Promise<void> {
    const file = await this.fileRepository.findById(command.fileId);
    if (!file || file.getOwnerId() !== command.ownerId) {
      throw new ORPCError('NOT_FOUND', {
        message: `File ${command.fileId} not found`,
      });
    }
    file.delete();

    await this.fileRepository.save(file);
  }
}
