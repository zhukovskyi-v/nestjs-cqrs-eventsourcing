import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FolderReadRepository } from '../../../infrastructure/projections/folder-read.repository';
import { GetFolderPathQuery } from '../get-folder-path.query';

@QueryHandler(GetFolderPathQuery)
export class GetFolderPathHandler implements IQueryHandler<GetFolderPathQuery> {
  constructor(private readonly folders: FolderReadRepository) {}

  execute(
    query: GetFolderPathQuery,
  ): Promise<Array<{ id: string; name: string }>> {
    return this.folders.getPath(query.ownerId, query.folderId);
  }
}
