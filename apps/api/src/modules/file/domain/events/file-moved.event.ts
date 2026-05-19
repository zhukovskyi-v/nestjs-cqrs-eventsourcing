import { DomainEvent } from '@/lib/shared/domain/domain-event.base';

export class FileMovedEvent extends DomainEvent {
  get eventType(): string {
    return 'FileMoved';
  }

  constructor(
    aggregateId: string,
    public readonly newFolderId: string | null,
  ) {
    super(aggregateId);
  }
}
