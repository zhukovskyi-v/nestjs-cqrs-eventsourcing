import { Query } from '@nestjs/cqrs';
import { Folder } from '@/lib/database/folder.schema';

export class GetRootFoldersQuery extends Query<Folder[]> {
  constructor(public readonly ownerId: string) {
    super();
  }
}
