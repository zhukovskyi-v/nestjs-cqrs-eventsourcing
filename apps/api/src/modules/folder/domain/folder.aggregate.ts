import { AggregateRootBase } from '@/lib/shared/domain/aggregate-root.base';
import { FolderCreatedEvent } from './events/folder-created.event';
import { FolderRenamedEvent } from './events/folder-renamed.event';
import { FolderMovedEvent } from './events/folder-moved.event';
import { FolderDeletedEvent } from './events/folder-deleted.event';
import { FolderSortOrderChangedEvent } from './events/folder-sort-order-changed.event';
import { FolderClonedEvent } from './events/folder-cloned.event';

export class FolderAggregate extends AggregateRootBase {
  private id: string;
  private name: string;
  private ownerId: string;
  private parentFolderId: string | null;
  private sortOrder = 0;
  private isDeleted = false;

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getOwnerId(): string {
    return this.ownerId;
  }

  getParentFolderId(): string | null {
    return this.parentFolderId;
  }

  getSortOrder(): number {
    return this.sortOrder;
  }

  getIsDeleted(): boolean {
    return this.isDeleted;
  }

  /* ---- Command methods ---- */

  static create(
    id: string,
    name: string,
    ownerId: string,
    parentFolderId: string | null,
    sortOrder: number,
  ): FolderAggregate {
    const folder = new FolderAggregate();
    folder.apply(
      new FolderCreatedEvent(id, name, ownerId, parentFolderId, sortOrder),
    );
    return folder;
  }

  static cloneFrom(
    newId: string,
    source: FolderAggregate,
    newName: string,
    sortOrder: number,
  ): FolderAggregate {
    const folder = new FolderAggregate();
    folder.apply(
      new FolderClonedEvent(
        newId,
        source.id,
        newName,
        source.ownerId,
        source.parentFolderId,
        sortOrder,
      ),
    );
    return folder;
  }

  rename(newName: string): void {
    this.ensureNotDeleted();
    if (this.name === newName) return;
    this.apply(new FolderRenamedEvent(this.id, newName));
  }

  move(newParentFolderId: string | null): void {
    this.ensureNotDeleted();
    if (this.parentFolderId === newParentFolderId) return;
    if (newParentFolderId === this.id) {
      throw new Error('Cannot move a folder into itself');
    }
    this.apply(new FolderMovedEvent(this.id, newParentFolderId));
  }

  reorder(newSortOrder: number): void {
    this.ensureNotDeleted();
    if (this.sortOrder === newSortOrder) return;
    this.apply(new FolderSortOrderChangedEvent(this.id, newSortOrder));
  }

  delete(): void {
    this.ensureNotDeleted();
    this.apply(new FolderDeletedEvent(this.id));
  }

  /* ---- Event handlers (state mutations) ---- */

  private onFolderCreatedEvent(event: FolderCreatedEvent): void {
    this.id = event.aggregateId;
    this.name = event.name;
    this.ownerId = event.ownerId;
    this.parentFolderId = event.parentFolderId;
    this.sortOrder = event.sortOrder ?? 0;
    this.isDeleted = false;
  }

  private onFolderClonedEvent(event: FolderClonedEvent): void {
    this.id = event.aggregateId;
    this.name = event.name;
    this.ownerId = event.ownerId;
    this.parentFolderId = event.parentFolderId;
    this.sortOrder = event.sortOrder ?? 0;
    this.isDeleted = false;
  }

  private onFolderRenamedEvent(event: FolderRenamedEvent): void {
    this.name = event.newName;
  }

  private onFolderMovedEvent(event: FolderMovedEvent): void {
    this.parentFolderId = event.newParentFolderId;
  }

  private onFolderSortOrderChangedEvent(
    event: FolderSortOrderChangedEvent,
  ): void {
    this.sortOrder = event.sortOrder;
  }

  private onFolderDeletedEvent(_event: FolderDeletedEvent): void {
    this.isDeleted = true;
  }

  /* ---- Guards ---- */

  private ensureNotDeleted(): void {
    if (this.isDeleted) {
      throw new Error('Cannot modify a deleted folder');
    }
  }
}
