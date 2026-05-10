import { Inject, Logger } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import {
  EventStoreDBClient,
  jsonEvent,
  FORWARDS,
  START,
  NO_STREAM,
  StreamNotFoundError,
} from '@eventstore/db-client';
import { AggregateRootBase } from '../../domain/aggregate-root.base';
import { DomainEvent } from '../../domain/domain-event.base';
import { EventSerializer } from './event-serializer';
import { EVENTSTORE_CLIENT } from './eventstore.constants';

export abstract class EventStoreRepository<T extends AggregateRootBase> {
  protected readonly logger = new Logger(this.constructor.name);

  protected constructor(
    @Inject(EVENTSTORE_CLIENT)
    protected readonly client: EventStoreDBClient,
    protected readonly eventPublisher: EventPublisher,
    protected readonly eventSerializer: EventSerializer,
  ) {}

  protected abstract streamName(aggregateId: string): string;
  protected abstract createEmptyAggregate(): T;

  async findById(aggregateId: string): Promise<T | null> {
    const stream = this.streamName(aggregateId);
    const aggregate = this.createEmptyAggregate();

    try {
      const resolvedEvents = this.client.readStream(stream, {
        direction: FORWARDS,
        fromRevision: START,
      });

      const events: DomainEvent[] = [];
      for await (const resolvedEvent of resolvedEvents) {
        if (resolvedEvent.event) {
          const domainEvent = this.eventSerializer.deserialize(
            resolvedEvent.event.type,
            resolvedEvent.event.data as Record<string, unknown>,
          );
          events.push(domainEvent);
        }
      }

      if (!events.length) {
        return null;
      }

      aggregate.loadFromHistory(events);
      this.eventPublisher.mergeObjectContext(aggregate);
      return aggregate;
    } catch (error) {
      if (error instanceof StreamNotFoundError) {
        return null;
      }
      throw error;
    }
  }

  async save(aggregate: T): Promise<void> {
    const uncommittedEvents = aggregate.getUncommittedEvents();
    if (!uncommittedEvents.length) {
      return;
    }

    const stream = this.streamName(uncommittedEvents[0].aggregateId);

    const eventsToAppend = uncommittedEvents.map((event) => {
      const serialized = this.eventSerializer.serialize(event);
      return jsonEvent({
        type: serialized.type,
        data: serialized.data,
        metadata: serialized.metadata,
      });
    });

    const expectedRevision =
      aggregate.version === -1 ? NO_STREAM : BigInt(aggregate.version);

    await this.client.appendToStream(stream, eventsToAppend, {
      expectedRevision,
    });

    const merged = this.eventPublisher.mergeObjectContext(aggregate);
    merged.commit();
  }
}
