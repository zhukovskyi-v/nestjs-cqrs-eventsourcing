import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import * as schema from '@/lib/database/file.schema';
import { FileReadRepository } from '../../../infrastructure/projections/file-read.repository';
import { GetFilesByFolderQuery } from '../get-files-by-folder.query';

@QueryHandler(GetFilesByFolderQuery)
export class GetFilesByFolderHandler implements IQueryHandler<GetFilesByFolderQuery> {
  constructor(private readonly files: FileReadRepository) {}

  execute(query: GetFilesByFolderQuery): Promise<schema.File[]> {
    return this.files.findByFolder(query.ownerId, query.folderId);
  }
}
