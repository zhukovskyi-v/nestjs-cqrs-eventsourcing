import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ORPCError } from '@orpc/nest';
import { CloneFileCommand } from '../clone-file.command';
import { FileRepository } from '../../../infrastructure/repositories/file.repository';
import { FileReadRepository } from '../../../infrastructure/projections/file-read.repository';
import { FileAggregate } from '../../../domain/file.aggregate';
import { CloudinaryService } from '@/lib/cloudinary/cloudinary.service';

@CommandHandler(CloneFileCommand)
export class CloneFileHandler implements ICommandHandler<
  CloneFileCommand,
  string
> {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly fileReads: FileReadRepository,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async execute(command: CloneFileCommand): Promise<string> {
    const source = await this.fileRepository.findById(command.sourceId);

    if (!source || source.getOwnerId() !== command.userId) {
      throw new ORPCError('NOT_FOUND', {
        message: `File ${command.sourceId} not found`,
      });
    }
    const lastDocumentOrder = await this.fileReads.getMaxSortOrder(
      command.userId,
      source.getFolderId(),
    );
    const copy = await this.cloudinary.copy(
      source.getBlobPathname(),
      command.userId,
    );

    const sortOrder = lastDocumentOrder + 1;
    const newId = crypto.randomUUID();
    const clone = FileAggregate.cloneFrom(
      newId,
      source,
      `${source.getName()} (copy)`,
      copy.url,
      copy.pathname,
      sortOrder,
    );

    await this.fileRepository.save(clone);

    return newId;
  }
}
