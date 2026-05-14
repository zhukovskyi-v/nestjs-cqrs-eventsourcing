import { Command } from '@nestjs/cqrs';

export class UploadFileCommand extends Command<string> {
  constructor(
    public readonly file: File,
    public readonly displayName: string,
    public readonly ownerId: string,
    public readonly folderId: string | null,
    public readonly isPublic: boolean,
  ) {
    super();
  }
}
