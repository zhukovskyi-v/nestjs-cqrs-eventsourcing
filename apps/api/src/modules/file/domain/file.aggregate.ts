import { AggregateRootBase } from '@/lib/shared/domain/aggregate-root.base';
import { FileCreatedEvent } from './events/file-created.event';
import { FileRenamedEvent } from './events/file-renamed.event';
import { FileVisibilityChangedEvent } from '@/modules/file/domain/events';
import { FileSortOrderChangedEvent } from '@/modules/file/domain/events';
import { FileClonedEvent } from './events/file-cloned.event';
import { FileDeletedEvent } from './events/file-deleted.event';
import { FileMovedEvent } from './events/file-moved.event';

export class FileAggregate extends AggregateRootBase {
  private id: string;
  private name: string;
  private ownerId: string;
  private folderId: string | null;
  private blobUrl: string;
  private blobPathname: string;
  private assetId: string;
  private size: number | null = null;
  private contentType: string | null = null;
  private isPublic = false;
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

  getFolderId(): string | null {
    return this.folderId;
  }

  getBlobUrl(): string {
    return this.blobUrl;
  }

  getBlobPathname(): string {
    return this.blobPathname;
  }

  getSize(): number | null {
    return this.size;
  }

  getContentType(): string | null {
    return this.contentType;
  }

  getIsPublic(): boolean {
    return this.isPublic;
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
    folderId: string | null,
    blobUrl: string,
    blobPathname: string,
    assetId: string,
    size: number | null,
    contentType: string | null,
    isPublic: boolean,
    sortOrder: number,
  ): FileAggregate {
    const file = new FileAggregate();
    file.apply(
      new FileCreatedEvent(
        id,
        name,
        ownerId,
        folderId,
        blobUrl,
        blobPathname,
        assetId,
        size,
        contentType,
        isPublic,
        sortOrder,
      ),
    );
    return file;
  }

  static cloneFrom(
    newId: string,
    source: FileAggregate,
    newName: string,
    blobUrl: string,
    blobPathname: string,
    sortOrder: number,
  ): FileAggregate {
    const file = new FileAggregate();
    file.apply(
      new FileClonedEvent(
        newId,
        source.id,
        newName,
        source.ownerId,
        source.folderId,
        blobUrl,
        blobPathname,
        source.assetId,
        source.size,
        source.contentType,
        source.isPublic,
        sortOrder,
      ),
    );
    return file;
  }

  rename(newName: string): void {
    this.ensureNotDeleted();
    if (this.name === newName) return;
    this.apply(new FileRenamedEvent(this.id, newName));
  }

  changeVisibility(isPublic: boolean): void {
    this.ensureNotDeleted();
    if (this.isPublic === isPublic) return;
    this.apply(new FileVisibilityChangedEvent(this.id, isPublic));
  }

  reorder(newSortOrder: number): void {
    this.ensureNotDeleted();
    if (this.sortOrder === newSortOrder) return;
    this.apply(new FileSortOrderChangedEvent(this.id, newSortOrder));
  }

  move(newFolderId: string | null): void {
    this.ensureNotDeleted();
    if (this.folderId === newFolderId) return;
    this.apply(new FileMovedEvent(this.id, newFolderId));
  }

  delete(): void {
    this.ensureNotDeleted();
    this.apply(new FileDeletedEvent(this.id, this.assetId));
  }

  /* ---- Event handlers (state mutations) ---- */

  private onFileCreatedEvent(event: FileCreatedEvent): void {
    this.id = event.aggregateId;
    this.name = event.name;
    this.ownerId = event.ownerId;
    this.folderId = event.folderId;
    this.blobUrl = event.blobUrl;
    this.blobPathname = event.blobPathname;
    this.size = event.size;
    this.contentType = event.contentType;
    this.isPublic = event.isPublic;
    this.sortOrder = event.sortOrder ?? 0;
    this.isDeleted = false;
    this.assetId = event.assetId;
  }

  private onFileClonedEvent(event: FileClonedEvent): void {
    this.id = event.aggregateId;
    this.name = event.name;
    this.ownerId = event.ownerId;
    this.folderId = event.folderId;
    this.blobUrl = event.blobUrl;
    this.blobPathname = event.blobPathname;
    this.size = event.size;
    this.contentType = event.contentType;
    this.isPublic = event.isPublic;
    this.sortOrder = event.sortOrder ?? 0;
    this.isDeleted = false;
    this.assetId = event.assetId;
  }

  private onFileRenamedEvent(event: FileRenamedEvent): void {
    this.name = event.newName;
  }

  private onFileVisibilityChangedEvent(
    event: FileVisibilityChangedEvent,
  ): void {
    this.isPublic = event.isPublic;
  }

  private onFileSortOrderChangedEvent(event: FileSortOrderChangedEvent): void {
    this.sortOrder = event.sortOrder;
  }

  private onFileMovedEvent(event: FileMovedEvent): void {
    this.folderId = event.newFolderId;
  }

  private onFileDeletedEvent(_event: FileDeletedEvent): void {
    this.isDeleted = true;
  }

  /* ---- Guards ---- */

  private ensureNotDeleted(): void {
    if (this.isDeleted) {
      throw new Error('Cannot modify a deleted file');
    }
  }
}
