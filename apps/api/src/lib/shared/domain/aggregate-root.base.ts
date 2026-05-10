import { AggregateRoot } from '@nestjs/cqrs';
import { DomainEvent } from './domain-event.base';

export abstract class AggregateRootBase extends AggregateRoot<DomainEvent> {
  private _version = -1;

  get version(): number {
    return this._version;
  }

  loadFromHistory(history: DomainEvent[]): void {
    super.loadFromHistory(history);
    this._version = history.length - 1;
  }
}
