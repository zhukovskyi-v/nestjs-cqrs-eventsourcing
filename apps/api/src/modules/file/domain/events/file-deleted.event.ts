import { DomainEvent } from '@/lib/shared/domain/domain-event.base';

export class FileDeletedEvent extends DomainEvent {
  get eventType(): string {
    return 'FileDeleted';
  }

  constructor(
    aggregateId: string,
    public readonly assetId: string,
  ) {
    super(aggregateId);
  }
}
