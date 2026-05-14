import { Injectable, Inject } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { EventStoreDBClient } from '@eventstore/db-client';
import { EventStoreRepository } from '@/lib/shared/infrastructure/eventstore/eventstore.repository';
import { EventSerializer } from '@/lib/shared/infrastructure/eventstore/event-serializer';
import { FileAggregate } from '../../domain/file.aggregate';
import { EVENTSTORE_CLIENT } from '@/lib/shared/infrastructure/eventstore/eventstore.constants';

@Injectable()
export class FileRepository extends EventStoreRepository<FileAggregate> {
  constructor(
    @Inject(EVENTSTORE_CLIENT) client: EventStoreDBClient,
    eventPublisher: EventPublisher,
    eventSerializer: EventSerializer,
  ) {
    super(client, eventPublisher, eventSerializer);
  }

  protected streamName(aggregateId: string): string {
    return `file-${aggregateId}`;
  }

  protected createEmptyAggregate(): FileAggregate {
    return new FileAggregate();
  }
}
