import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ORPCError } from '@orpc/nest';
import { DeleteFolderCommand } from '../delete-folder.command';
import { FolderRepository } from '../../../infrastructure/repositories/folder.repository';

@CommandHandler(DeleteFolderCommand)
export class DeleteFolderHandler implements ICommandHandler<DeleteFolderCommand> {
  constructor(private readonly folderRepository: FolderRepository) {}

  async execute(command: DeleteFolderCommand): Promise<void> {
    const folder = await this.folderRepository.findById(command.folderId);
    if (!folder || folder.getOwnerId() !== command.ownerId) {
      throw new ORPCError('NOT_FOUND', {
        message: `Folder ${command.folderId} not found`,
      });
    }
    folder.delete();
    await this.folderRepository.save(folder);
  }
}
