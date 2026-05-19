import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ORPCError } from '@orpc/nest';
import { MoveFileCommand } from '../move-file.command';
import { FileRepository } from '../../../infrastructure/repositories/file.repository';
import { FolderReadRepository } from '@/modules/folder/infrastructure/projections/folder-read.repository';

@CommandHandler(MoveFileCommand)
export class MoveFileHandler implements ICommandHandler<MoveFileCommand> {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly folderReads: FolderReadRepository,
  ) {}

  async execute(command: MoveFileCommand): Promise<void> {
    const file = await this.fileRepository.findById(command.fileId);
    if (!file || file.getOwnerId() !== command.ownerId) {
      throw new ORPCError('NOT_FOUND', {
        message: `File ${command.fileId} not found`,
      });
    }

    if (command.newFolderId) {
      const parent = await this.folderReads.findOneOwned(
        command.ownerId,
        command.newFolderId,
      );
      if (!parent) {
        throw new ORPCError('NOT_FOUND', {
          message: `Folder ${command.newFolderId} not found`,
        });
      }
    }

    file.move(command.newFolderId);
    await this.fileRepository.save(file);
  }
}
