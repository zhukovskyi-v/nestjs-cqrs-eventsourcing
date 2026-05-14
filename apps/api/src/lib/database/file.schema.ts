import {
  pgTable,
  uuid,
  varchar,
  boolean,
  text,
  bigint,
  timestamp,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const files = pgTable(
  'files',
  {
    id: uuid('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    ownerId: uuid('ownerId').notNull(),
    folderId: uuid('folderId'),
    blobUrl: text('blobUrl').notNull(),
    blobPathname: text('blobPathname').notNull(),
    assetId: uuid('assetId').notNull(),
    isPublic: boolean('isPublic').notNull().default(false),
    size: bigint('size', { mode: 'number' }),
    contentType: varchar('contentType', { length: 255 }),
    sortOrder: integer('sortOrder').notNull().default(0),
    isDeleted: boolean('isDeleted').notNull().default(false),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [
    index('files_owner_folder_active_sort_idx').on(
      table.ownerId,
      table.folderId,
      table.isDeleted,
      table.sortOrder,
    ),
    index('files_owner_active_name_idx').on(
      table.ownerId,
      table.isDeleted,
      table.name,
    ),
  ],
);

export type File = InferSelectModel<typeof files>;
export type NewFile = InferInsertModel<typeof files>;
