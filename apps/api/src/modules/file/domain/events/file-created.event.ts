import { DomainEvent } from '@/lib/shared/domain/domain-event.base';

export class FileCreatedEvent extends DomainEvent {
  get eventType(): string {
    return 'FileCreated';
  }

  constructor(
    aggregateId: string,
    public readonly name: string,
    public readonly ownerId: string,
    public readonly folderId: string | null,
    public readonly blobUrl: string,
    public readonly blobPathname: string,
    public readonly assetId: string,
    public readonly size: number | null,
    public readonly contentType: string | null,
    public readonly isPublic: boolean,
    public readonly sortOrder: number,
  ) {
    super(aggregateId);
  }
}
