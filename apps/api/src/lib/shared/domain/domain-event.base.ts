import { IEvent } from '@nestjs/cqrs';

export abstract class DomainEvent implements IEvent {
  readonly occurredOn: Date;
  readonly eventVersion: number = 1;

  protected constructor(public readonly aggregateId: string) {
    this.occurredOn = new Date();
  }

  abstract get eventType(): string;
}
