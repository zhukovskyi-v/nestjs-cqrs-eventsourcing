import { DomainEvent } from '@/lib/shared/domain/domain-event.base';

export class FileVisibilityChangedEvent extends DomainEvent {
  get eventType(): string {
    return 'FileVisibilityChanged';
  }

  constructor(
    aggregateId: string,
    public readonly isPublic: boolean,
  ) {
    super(aggregateId);
  }
}
