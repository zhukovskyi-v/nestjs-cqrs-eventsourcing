import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import * as schema from '@/lib/database/file.schema';
import { FileReadRepository } from '../../../infrastructure/projections/file-read.repository';
import { SearchFilesQuery } from '../search-files.query';

@QueryHandler(SearchFilesQuery)
export class SearchFilesHandler implements IQueryHandler<SearchFilesQuery> {
  constructor(private readonly files: FileReadRepository) {}

  execute(query: SearchFilesQuery): Promise<schema.File[]> {
    return this.files.search(query.ownerId, query.query, query.folderId);
  }
}
