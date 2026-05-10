import { EventSerializer } from '@/lib/shared/infrastructure/eventstore/event-serializer';
import { FolderCreatedEvent } from './folder-created.event';
import { FolderRenamedEvent } from './folder-renamed.event';
import { FolderMovedEvent } from './folder-moved.event';
import { FolderDeletedEvent } from './folder-deleted.event';
import { FolderSortOrderChangedEvent } from './folder-sort-order-changed.event';
import { FolderClonedEvent } from './folder-cloned.event';

export { FolderCreatedEvent } from './folder-created.event';
export { FolderRenamedEvent } from './folder-renamed.event';
export { FolderMovedEvent } from './folder-moved.event';
export { FolderDeletedEvent } from './folder-deleted.event';
export { FolderSortOrderChangedEvent } from './folder-sort-order-changed.event';
export { FolderClonedEvent } from './folder-cloned.event';

export function registerFolderEvents(serializer: EventSerializer): void {
  serializer.register('FolderCreated', FolderCreatedEvent);
  serializer.register('FolderRenamed', FolderRenamedEvent);
  serializer.register('FolderMoved', FolderMovedEvent);
  serializer.register('FolderDeleted', FolderDeletedEvent);
  serializer.register('FolderSortOrderChanged', FolderSortOrderChangedEvent);
  serializer.register('FolderCloned', FolderClonedEvent);
}
