import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { eq } from 'drizzle-orm';
import * as schema from '@/lib/database/folder.schema';
import { DRIZZLE } from '@/lib/database/database.module';
import type { Database } from '@/lib/database/database.module';
import {
  FolderCreatedEvent,
  FolderRenamedEvent,
  FolderMovedEvent,
  FolderDeletedEvent,
  FolderSortOrderChangedEvent,
  FolderClonedEvent,
} from '@/modules/folder/domain/events';

type FolderEvent =
  | FolderCreatedEvent
  | FolderRenamedEvent
  | FolderMovedEvent
  | FolderDeletedEvent
  | FolderSortOrderChangedEvent
  | FolderClonedEvent;

@EventsHandler(
  FolderCreatedEvent,
  FolderRenamedEvent,
  FolderMovedEvent,
  FolderDeletedEvent,
  FolderSortOrderChangedEvent,
  FolderClonedEvent,
)
export class FolderProjection implements IEventHandler<FolderEvent> {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: Database,
  ) {}

  async handle(event: FolderEvent): Promise<void> {
    if (event instanceof FolderCreatedEvent) {
      await this.db.insert(schema.folders).values({
        id: event.aggregateId,
        name: event.name,
        ownerId: event.ownerId,
        parentFolderId: event.parentFolderId,
        sortOrder: event.sortOrder ?? 0,
        isDeleted: false,
      });
      return;
    }

    if (event instanceof FolderClonedEvent) {
      await this.db.insert(schema.folders).values({
        id: event.aggregateId,
        name: event.name,
        ownerId: event.ownerId,
        parentFolderId: event.parentFolderId,
        sortOrder: event.sortOrder ?? 0,
        isDeleted: false,
      });
      return;
    }

    if (event instanceof FolderRenamedEvent) {
      await this.db
        .update(schema.folders)
        .set({ name: event.newName, updatedAt: new Date() })
        .where(eq(schema.folders.id, event.aggregateId));
      return;
    }

    if (event instanceof FolderMovedEvent) {
      await this.db
        .update(schema.folders)
        .set({
          parentFolderId: event.newParentFolderId,
          updatedAt: new Date(),
        })
        .where(eq(schema.folders.id, event.aggregateId));
      return;
    }

    if (event instanceof FolderSortOrderChangedEvent) {
      await this.db
        .update(schema.folders)
        .set({ sortOrder: event.sortOrder, updatedAt: new Date() })
        .where(eq(schema.folders.id, event.aggregateId));
      return;
    }

    if (event instanceof FolderDeletedEvent) {
      await this.db
        .update(schema.folders)
        .set({ isDeleted: true, updatedAt: new Date() })
        .where(eq(schema.folders.id, event.aggregateId));
    }
  }
}
