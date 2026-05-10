import { Query } from '@nestjs/cqrs';

export class GetFolderPathQuery extends Query<
  Array<{ id: string; name: string }>
> {
  constructor(
    public readonly ownerId: string,
    public readonly folderId: string,
  ) {
    super();
  }
}
