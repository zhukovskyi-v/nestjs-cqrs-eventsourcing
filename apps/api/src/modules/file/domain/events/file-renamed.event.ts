import { DomainEvent } from '@/lib/shared/domain/domain-event.base';

export class FileRenamedEvent extends DomainEvent {
  get eventType(): string {
    return 'FileRenamed';
  }

  constructor(
    aggregateId: string,
    public readonly newName: string,
  ) {
    super(aggregateId);
  }
}
