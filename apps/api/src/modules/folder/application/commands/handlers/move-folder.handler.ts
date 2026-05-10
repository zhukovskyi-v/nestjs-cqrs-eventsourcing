import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ORPCError } from '@orpc/nest';
import { MoveFolderCommand } from '../move-folder.command';
import { FolderRepository } from '../../../infrastructure/repositories/folder.repository';
import { FolderReadRepository } from '../../../infrastructure/projections/folder-read.repository';

@CommandHandler(MoveFolderCommand)
export class MoveFolderHandler implements ICommandHandler<MoveFolderCommand> {
  constructor(
    private readonly folderRepository: FolderRepository,
    private readonly folderReads: FolderReadRepository,
  ) {}

  async execute(command: MoveFolderCommand): Promise<void> {
    const folder = await this.folderRepository.findById(command.folderId);
    if (!folder || folder.getOwnerId() !== command.ownerId) {
      throw new ORPCError('NOT_FOUND', {
        message: `Folder ${command.folderId} not found`,
      });
    }

    if (command.newParentFolderId) {
      const parent = await this.folderReads.findOneOwned(
        command.ownerId,
        command.newParentFolderId,
      );
      if (!parent) {
        throw new ORPCError('NOT_FOUND', {
          message: `Folder ${command.newParentFolderId} not found`,
        });
      }
    }

    folder.move(command.newParentFolderId);
    await this.folderRepository.save(folder);
  }
}
