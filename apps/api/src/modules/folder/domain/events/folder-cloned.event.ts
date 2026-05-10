import { DomainEvent } from '@/lib/shared/domain/domain-event.base';

export class FolderClonedEvent extends DomainEvent {
  get eventType(): string {
    return 'FolderCloned';
  }

  constructor(
    aggregateId: string,
    public readonly sourceId: string,
    public readonly name: string,
    public readonly ownerId: string,
    public readonly parentFolderId: string | null,
    public readonly sortOrder: number,
  ) {
    super(aggregateId);
  }
}
