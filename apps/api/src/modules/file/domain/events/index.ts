import { EventSerializer } from '@/lib/shared/infrastructure/eventstore/event-serializer';
import { FileCreatedEvent } from './file-created.event';
import { FileRenamedEvent } from './file-renamed.event';
import { FileVisibilityChangedEvent } from './file-visibility-changed.event';
import { FileSortOrderChangedEvent } from './file-sort-order-changed.event';
import { FileClonedEvent } from './file-cloned.event';
import { FileDeletedEvent } from './file-deleted.event';

export { FileCreatedEvent } from './file-created.event';
export { FileRenamedEvent } from './file-renamed.event';
export { FileVisibilityChangedEvent } from './file-visibility-changed.event';
export { FileSortOrderChangedEvent } from './file-sort-order-changed.event';
export { FileClonedEvent } from './file-cloned.event';
export { FileDeletedEvent } from './file-deleted.event';

export function registerFileEvents(serializer: EventSerializer): void {
  serializer.register('FileCreated', FileCreatedEvent);
  serializer.register('FileRenamed', FileRenamedEvent);
  serializer.register('FileVisibilityChanged', FileVisibilityChangedEvent);
  serializer.register('FileSortOrderChanged', FileSortOrderChangedEvent);
  serializer.register('FileCloned', FileClonedEvent);
  serializer.register('FileDeleted', FileDeletedEvent);
}
