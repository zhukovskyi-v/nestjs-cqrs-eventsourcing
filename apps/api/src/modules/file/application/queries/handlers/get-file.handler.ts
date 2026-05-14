import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import * as schema from '@/lib/database/file.schema';
import { FileReadRepository } from '../../../infrastructure/projections/file-read.repository';
import { GetFileQuery } from '../get-file.query';

@QueryHandler(GetFileQuery)
export class GetFileHandler implements IQueryHandler<GetFileQuery> {
  constructor(private readonly files: FileReadRepository) {}

  execute(query: GetFileQuery): Promise<schema.File | null> {
    return this.files.findOneOwned(query.ownerId, query.fileId);
  }
}
