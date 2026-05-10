import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ORPCError } from '@orpc/nest';
import { ReorderFoldersCommand } from '../reorder-folders.command';
import { FolderRepository } from '../../../infrastructure/repositories/folder.repository';
import { FolderReadRepository } from '../../../infrastructure/projections/folder-read.repository';

@CommandHandler(ReorderFoldersCommand)
export class ReorderFoldersHandler implements ICommandHandler<ReorderFoldersCommand> {
  constructor(
    private readonly folderRepository: FolderRepository,
    private readonly folderReads: FolderReadRepository,
  ) {}

  async execute(command: ReorderFoldersCommand): Promise<void> {
    const siblings = await this.folderReads.findChildren(
      command.ownerId,
      command.parentFolderId,
    );
    const siblingIds = new Set(siblings.map((s) => s.id));

    if (
      command.orderedIds.length !== siblingIds.size ||
      command.orderedIds.some((id) => !siblingIds.has(id))
    ) {
      throw new ORPCError('BAD_REQUEST', {
        message:
          'orderedIds must be a permutation of the current sibling folder ids',
      });
    }

    for (let i = 0; i < command.orderedIds.length; i++) {
      const id = command.orderedIds[i];
      const folder = await this.folderRepository.findById(id);
      if (!folder || folder.getOwnerId() !== command.ownerId) {
        throw new ORPCError('NOT_FOUND', {
          message: `Folder ${id} not found`,
        });
      }
      folder.reorder(i);
      await this.folderRepository.save(folder);
    }
  }
}
