import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ORPCError } from '@orpc/nest';
import { CloneFolderCommand } from '../clone-folder.command';
import { FolderRepository } from '../../../infrastructure/repositories/folder.repository';
import { FolderAggregate } from '../../../domain/folder.aggregate';

@CommandHandler(CloneFolderCommand)
export class CloneFolderHandler implements ICommandHandler<
  CloneFolderCommand,
  string
> {
  constructor(private readonly folderRepository: FolderRepository) {}

  async execute(command: CloneFolderCommand): Promise<string> {
    const source = await this.folderRepository.findById(command.sourceId);

    if (!source || source.getOwnerId() !== command.ownerId) {
      throw new ORPCError('NOT_FOUND', {
        message: `Folder ${command.sourceId} not found`,
      });
    }

    const sortOrder = source.getSortOrder() + 1;
    const newId = crypto.randomUUID();
    const clone = FolderAggregate.cloneFrom(
      newId,
      source,
      `${source.getName()} (copy)`,
      sortOrder,
    );
    await this.folderRepository.save(clone);
    return newId;
  }
}
