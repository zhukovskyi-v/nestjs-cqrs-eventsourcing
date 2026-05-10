import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ORPCError } from '@orpc/nest';
import { RenameFolderCommand } from '../rename-folder.command';
import { FolderRepository } from '../../../infrastructure/repositories/folder.repository';

@CommandHandler(RenameFolderCommand)
export class RenameFolderHandler implements ICommandHandler<RenameFolderCommand> {
  constructor(private readonly folderRepository: FolderRepository) {}

  async execute(command: RenameFolderCommand): Promise<void> {
    const folder = await this.folderRepository.findById(command.folderId);
    if (!folder || folder.getOwnerId() !== command.ownerId) {
      throw new ORPCError('NOT_FOUND', {
        message: `Folder ${command.folderId} not found`,
      });
    }
    folder.rename(command.newName);
    await this.folderRepository.save(folder);
  }
}
