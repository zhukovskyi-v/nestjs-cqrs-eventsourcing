import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ORPCError } from '@orpc/nest';
import { ReorderFilesCommand } from '../reorder-files.command';
import { FileRepository } from '../../../infrastructure/repositories/file.repository';
import { FileReadRepository } from '../../../infrastructure/projections/file-read.repository';

@CommandHandler(ReorderFilesCommand)
export class ReorderFilesHandler implements ICommandHandler<ReorderFilesCommand> {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly fileReads: FileReadRepository,
  ) {}

  async execute(command: ReorderFilesCommand): Promise<void> {
    const siblings = await this.fileReads.findByFolder(
      command.ownerId,
      command.folderId,
    );
    const siblingIds = new Set(siblings.map((s) => s.id));

    if (
      command.orderedIds.length !== siblingIds.size ||
      command.orderedIds.some((id) => !siblingIds.has(id))
    ) {
      throw new ORPCError('BAD_REQUEST', {
        message:
          'orderedIds must be a permutation of the current sibling file ids',
      });
    }

    for (let i = 0; i < command.orderedIds.length; i++) {
      const id = command.orderedIds[i];
      const file = await this.fileRepository.findById(id);
      if (!file || file.getOwnerId() !== command.ownerId) {
        throw new ORPCError('NOT_FOUND', {
          message: `File ${id} not found`,
        });
      }
      file.reorder(i);
      await this.fileRepository.save(file);
    }
  }
}
