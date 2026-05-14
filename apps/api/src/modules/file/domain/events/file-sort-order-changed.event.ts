import { DomainEvent } from '@/lib/shared/domain/domain-event.base';

export class FileSortOrderChangedEvent extends DomainEvent {
  get eventType(): string {
    return 'FileSortOrderChanged';
  }

  constructor(
    aggregateId: string,
    public readonly sortOrder: number,
  ) {
    super(aggregateId);
  }
}
