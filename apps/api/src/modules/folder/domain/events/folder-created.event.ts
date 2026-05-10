import { DomainEvent } from '@/lib/shared/domain/domain-event.base';

export class FolderCreatedEvent extends DomainEvent {
  get eventType(): string {
    return 'FolderCreated';
  }

  constructor(
    aggregateId: string,
    public readonly name: string,
    public readonly ownerId: string,
    public readonly parentFolderId: string | null,
    public readonly sortOrder: number,
  ) {
    super(aggregateId);
  }
}
