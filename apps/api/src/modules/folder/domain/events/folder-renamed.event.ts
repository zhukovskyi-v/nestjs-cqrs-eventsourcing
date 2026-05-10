import { DomainEvent } from '@/lib/shared/domain/domain-event.base';

export class FolderRenamedEvent extends DomainEvent {
  get eventType(): string {
    return 'FolderRenamed';
  }

  constructor(
    aggregateId: string,
    public readonly newName: string,
  ) {
    super(aggregateId);
  }
}
