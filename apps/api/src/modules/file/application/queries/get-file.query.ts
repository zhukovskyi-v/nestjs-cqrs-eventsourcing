import { Query } from '@nestjs/cqrs';
import { File } from '@/lib/database/file.schema';

export class GetFileQuery extends Query<File | null> {
  constructor(
    public readonly fileId: string,
    public readonly ownerId: string,
  ) {
    super();
  }
}
