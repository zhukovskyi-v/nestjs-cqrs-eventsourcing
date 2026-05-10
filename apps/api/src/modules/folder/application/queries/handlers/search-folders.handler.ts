import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import * as schema from '@/lib/database/folder.schema';
import { FolderReadRepository } from '../../../infrastructure/projections/folder-read.repository';
import { SearchFoldersQuery } from '../search-folders.query';

@QueryHandler(SearchFoldersQuery)
export class SearchFoldersHandler implements IQueryHandler<SearchFoldersQuery> {
  constructor(private readonly folders: FolderReadRepository) {}

  execute(query: SearchFoldersQuery): Promise<schema.Folder[]> {
    return this.folders.search(
      query.ownerId,
      query.query,
      query.parentFolderId,
    );
  }
}
