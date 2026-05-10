import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import * as schema from '@/lib/database/folder.schema';
import { FolderReadRepository } from '../../../infrastructure/projections/folder-read.repository';
import { GetFoldersByParentQuery } from '../get-folders-by-parent.query';

@QueryHandler(GetFoldersByParentQuery)
export class GetFoldersByParentHandler implements IQueryHandler<GetFoldersByParentQuery> {
  constructor(private readonly folders: FolderReadRepository) {}

  execute(query: GetFoldersByParentQuery): Promise<schema.Folder[]> {
    return this.folders.findChildren(query.ownerId, query.parentFolderId);
  }
}
