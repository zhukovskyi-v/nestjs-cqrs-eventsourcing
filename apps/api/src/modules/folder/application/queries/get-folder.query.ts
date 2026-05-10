import { Query } from '@nestjs/cqrs';
import { Folder } from '@/lib/database/folder.schema';

export class GetFolderQuery extends Query<Folder | null> {
  constructor(
    public readonly folderId: string,
    public readonly ownerId: string,
  ) {
    super();
  }
}
