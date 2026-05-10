import { Query } from '@nestjs/cqrs';
import { Folder } from '@/lib/database/folder.schema';

export class SearchFoldersQuery extends Query<Folder[]> {
  constructor(
    public readonly ownerId: string,
    public readonly query: string,
    public readonly parentFolderId: string | null | undefined,
  ) {
    super();
  }
}
