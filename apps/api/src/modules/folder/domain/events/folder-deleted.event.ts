import { DomainEvent } from '@/lib/shared/domain/domain-event.base';

export class FolderDeletedEvent extends DomainEvent {
  get eventType(): string {
    return 'FolderDeleted';
  }

  constructor(aggregateId: string) {
    super(aggregateId);
  }
}
