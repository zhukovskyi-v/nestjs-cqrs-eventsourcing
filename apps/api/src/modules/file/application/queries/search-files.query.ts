import { Query } from '@nestjs/cqrs';
import { File } from '@/lib/database/file.schema';

export class SearchFilesQuery extends Query<File[]> {
  constructor(
    public readonly ownerId: string,
    public readonly query: string,
    public readonly folderId: string | null | undefined,
  ) {
    super();
  }
}
