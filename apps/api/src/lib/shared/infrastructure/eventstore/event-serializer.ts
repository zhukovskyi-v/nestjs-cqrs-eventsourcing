import { Injectable } from '@nestjs/common';
import { DomainEvent } from '../../domain/domain-event.base';

type EventConstructor = new (...args: any[]) => DomainEvent;

@Injectable()
export class EventSerializer {
  private readonly eventMap = new Map<string, EventConstructor>();

  register(eventType: string, constructor: EventConstructor): void {
    this.eventMap.set(eventType, constructor);
  }

  serialize(event: DomainEvent): {
    type: string;
    data: Record<string, unknown>;
    metadata: Record<string, unknown>;
  } {
    return {
      type: event.eventType,
      data: { ...event },
      metadata: {
        occurredOn: event.occurredOn.toISOString(),
        eventVersion: event.eventVersion,
      },
    };
  }

  deserialize(eventType: string, data: Record<string, unknown>): DomainEvent {
    const Constructor = this.eventMap.get(eventType);
    if (!Constructor) {
      throw new Error(
        `Unknown event type: ${eventType}. Did you register it in the EventSerializer?`,
      );
    }
    return Object.assign(
      Object.create(Constructor.prototype) as DomainEvent,
      data,
    );
  }
}
