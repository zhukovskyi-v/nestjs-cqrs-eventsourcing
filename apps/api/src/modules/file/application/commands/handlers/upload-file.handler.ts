import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { ORPCError } from '@orpc/nest';
import { UploadFileCommand } from '../upload-file.command';
import { FileRepository } from '../../../infrastructure/repositories/file.repository';
import { FolderReadRepository } from '@/modules/folder/infrastructure/projections/folder-read.repository';
import { FileAggregate } from '../../../domain/file.aggregate';
import { CloudinaryService } from '@/lib/cloudinary/cloudinary.service';

@CommandHandler(UploadFileCommand)
export class UploadFileHandler implements ICommandHandler<
  UploadFileCommand,
  string
> {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly folderReads: FolderReadRepository,
    private readonly cloudinary: CloudinaryService,
    private readonly config: ConfigService,
  ) {}

  async execute(command: UploadFileCommand): Promise<string> {
    const maxBytes = this.config.getOrThrow<number>('cloudinary.maxFileBytes');

    if (command.file.size > maxBytes) {
      throw new ORPCError('PAYLOAD_TOO_LARGE', {
        message: `File exceeds max size of ${maxBytes} bytes`,
      });
    }

    const allowed = this.config.getOrThrow<string[]>(
      'cloudinary.allowedMimeTypes',
    );

    if (!allowed.includes(command.file.type)) {
      throw new ORPCError('UNSUPPORTED_MEDIA_TYPE', {
        message: `Unsupported content type "${command.file.type}". Allowed: ${allowed.join(', ')}`,
      });
    }

    const [buffer] = await Promise.all([
      command.file.arrayBuffer().then((b) => Buffer.from(b)),
      command.folderId
        ? this.folderReads
            .findOneOwned(command.ownerId, command.folderId)
            .then((parent) => {
              if (!parent) {
                throw new ORPCError('NOT_FOUND', {
                  message: `Folder ${command.folderId} not found`,
                });
              }
            })
        : null,
    ]);

    const uploaded = await this.cloudinary.upload(buffer, {
      ownerId: command.ownerId,
      originalName: command.file.name,
      isPublic: command.isPublic,
      contentType: command.file.type,
    });

    const fileId = crypto.randomUUID();
    const file = FileAggregate.create(
      fileId,
      command.displayName,
      command.ownerId,
      command.folderId,
      uploaded.url,
      uploaded.pathname,
      uploaded.assetId,
      uploaded.size,
      uploaded.contentType,
      command.isPublic,
      Date.now(),
    );
    await this.fileRepository.save(file);
    return fileId;
  }
}
