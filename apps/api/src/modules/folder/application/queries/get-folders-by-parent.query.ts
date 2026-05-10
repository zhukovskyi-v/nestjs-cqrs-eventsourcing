import { Query } from '@nestjs/cqrs';
import { Folder } from '@/lib/database/folder.schema';

export class GetFoldersByParentQuery extends Query<Folder[]> {
  constructor(
    public readonly ownerId: string,
    public readonly parentFolderId: string,
  ) {
    super();
  }
}
