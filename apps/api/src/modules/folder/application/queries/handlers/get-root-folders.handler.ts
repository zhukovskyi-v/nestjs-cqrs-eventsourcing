import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Folder } from '@/lib/database/folder.schema';
import { FolderReadRepository } from '../../../infrastructure/projections/folder-read.repository';
import { GetRootFoldersQuery } from '../get-root-folders.query';

@QueryHandler(GetRootFoldersQuery)
export class GetRootFoldersHandler implements IQueryHandler<GetRootFoldersQuery> {
  constructor(private readonly folders: FolderReadRepository) {}

  execute(query: GetRootFoldersQuery): Promise<Folder[]> {
    return this.folders.findRootsByOwner(query.ownerId);
  }
}
