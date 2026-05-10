import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import * as schema from '@/lib/database/folder.schema';
import { FolderReadRepository } from '../../../infrastructure/projections/folder-read.repository';
import { GetFolderQuery } from '../get-folder.query';

@QueryHandler(GetFolderQuery)
export class GetFolderHandler implements IQueryHandler<GetFolderQuery> {
  constructor(private readonly folders: FolderReadRepository) {}

  execute(query: GetFolderQuery): Promise<schema.Folder | null> {
    return this.folders.findOneOwned(query.ownerId, query.folderId);
  }
}
