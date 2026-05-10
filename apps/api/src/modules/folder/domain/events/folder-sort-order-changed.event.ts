import { DomainEvent } from '@/lib/shared/domain/domain-event.base';

export class FolderSortOrderChangedEvent extends DomainEvent {
  get eventType(): string {
    return 'FolderSortOrderChanged';
  }

  constructor(
    aggregateId: string,
    public readonly sortOrder: number,
  ) {
    super(aggregateId);
  }
}
