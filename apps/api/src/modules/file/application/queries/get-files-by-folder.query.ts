import { Query } from '@nestjs/cqrs';
import { File } from '@/lib/database/file.schema';

export class GetFilesByFolderQuery extends Query<File[]> {
  constructor(
    public readonly ownerId: string,
    public readonly folderId: string | null,
  ) {
    super();
  }
}
