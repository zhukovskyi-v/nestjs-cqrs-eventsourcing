import {
  pgTable,
  uuid,
  varchar,
  boolean,
  bigint,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const folders = pgTable(
  'folders',
  {
    id: uuid('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    ownerId: uuid('ownerId').notNull(),
    parentFolderId: uuid('parentFolderId'),
    sortOrder: bigint('sortOrder', { mode: 'number' }).notNull().default(0),
    isDeleted: boolean('isDeleted').notNull().default(false),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [
    index('folders_owner_parent_active_sort_idx').on(
      table.ownerId,
      table.parentFolderId,
      table.isDeleted,
      table.sortOrder,
    ),
    index('folders_owner_active_name_idx').on(
      table.ownerId,
      table.isDeleted,
      table.name,
    ),
  ],
);

export type Folder = InferSelectModel<typeof folders>;
export type NewFolder = InferInsertModel<typeof folders>;
