import { DomainEvent } from '@/lib/shared/domain/domain-event.base';

export class FolderMovedEvent extends DomainEvent {
  get eventType(): string {
    return 'FolderMoved';
  }

  constructor(
    aggregateId: string,
    public readonly newParentFolderId: string | null,
  ) {
    super(aggregateId);
  }
}
