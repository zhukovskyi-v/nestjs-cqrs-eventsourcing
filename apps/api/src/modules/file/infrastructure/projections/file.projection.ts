import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { eq } from 'drizzle-orm';
import * as schema from '@/lib/database/file.schema';
import { DRIZZLE } from '@/lib/database/database.module';
import type { Database } from '@/lib/database/database.module';
import {
  FileCreatedEvent,
  FileRenamedEvent,
  FileVisibilityChangedEvent,
  FileSortOrderChangedEvent,
  FileClonedEvent,
  FileDeletedEvent,
} from '@/modules/file/domain/events';

type FileEvent =
  | FileCreatedEvent
  | FileRenamedEvent
  | FileVisibilityChangedEvent
  | FileSortOrderChangedEvent
  | FileClonedEvent
  | FileDeletedEvent;

@EventsHandler(
  FileCreatedEvent,
  FileRenamedEvent,
  FileVisibilityChangedEvent,
  FileSortOrderChangedEvent,
  FileClonedEvent,
  FileDeletedEvent,
)
export class FileProjection implements IEventHandler<FileEvent> {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: Database,
  ) {}

  async handle(event: FileEvent): Promise<void> {
    if (event instanceof FileCreatedEvent) {
      await this.db.insert(schema.files).values({
        id: event.aggregateId,
        name: event.name,
        ownerId: event.ownerId,
        folderId: event.folderId,
        blobUrl: event.blobUrl,
        blobPathname: event.blobPathname,
        size: event.size,
        contentType: event.contentType,
        isPublic: event.isPublic,
        sortOrder: event.sortOrder ?? 0,
        isDeleted: false,
        assetId: event.assetId,
      });
      return;
    }

    if (event instanceof FileClonedEvent) {
      await this.db.insert(schema.files).values({
        id: event.aggregateId,
        name: event.name,
        ownerId: event.ownerId,
        folderId: event.folderId,
        blobUrl: event.blobUrl,
        blobPathname: event.blobPathname,
        size: event.size,
        contentType: event.contentType,
        isPublic: event.isPublic,
        sortOrder: event.sortOrder ?? 0,
        isDeleted: false,
        assetId: event.assetId,
      });
      return;
    }

    if (event instanceof FileRenamedEvent) {
      await this.db
        .update(schema.files)
        .set({ name: event.newName, updatedAt: new Date() })
        .where(eq(schema.files.id, event.aggregateId));
      return;
    }

    if (event instanceof FileVisibilityChangedEvent) {
      await this.db
        .update(schema.files)
        .set({ isPublic: event.isPublic, updatedAt: new Date() })
        .where(eq(schema.files.id, event.aggregateId));
      return;
    }

    if (event instanceof FileSortOrderChangedEvent) {
      await this.db
        .update(schema.files)
        .set({ sortOrder: event.sortOrder, updatedAt: new Date() })
        .where(eq(schema.files.id, event.aggregateId));
      return;
    }

    if (event instanceof FileDeletedEvent) {
      await this.db
        .update(schema.files)
        .set({ isDeleted: true, updatedAt: new Date() })
        .where(eq(schema.files.id, event.aggregateId));
    }
  }
}
