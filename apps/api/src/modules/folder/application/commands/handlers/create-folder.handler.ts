import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ORPCError } from '@orpc/nest';
import { CreateFolderCommand } from '../create-folder.command';
import { FolderRepository } from '../../../infrastructure/repositories/folder.repository';
import { FolderReadRepository } from '../../../infrastructure/projections/folder-read.repository';
import { FolderAggregate } from '../../../domain/folder.aggregate';

@CommandHandler(CreateFolderCommand)
export class CreateFolderHandler implements ICommandHandler<
  CreateFolderCommand,
  string
> {
  constructor(
    private readonly folderRepository: FolderRepository,
    private readonly folderReads: FolderReadRepository,
  ) {}

  async execute(command: CreateFolderCommand): Promise<string> {
    if (command.parentFolderId) {
      const parent = await this.folderReads.findOneOwned(
        command.ownerId,
        command.parentFolderId,
      );
      if (!parent) {
        throw new ORPCError('NOT_FOUND', {
          message: `Folder ${command.parentFolderId} not found`,
        });
      }
    }

    const sortOrder = Date.now();
    const folderId = crypto.randomUUID();
    const folder = FolderAggregate.create(
      folderId,
      command.name,
      command.ownerId,
      command.parentFolderId,
      sortOrder,
    );
    await this.folderRepository.save(folder);
    return folderId;
  }
}
