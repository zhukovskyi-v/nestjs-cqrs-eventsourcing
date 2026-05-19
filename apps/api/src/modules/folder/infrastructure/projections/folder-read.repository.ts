import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, ilike, isNull, sql } from 'drizzle-orm';
import * as schema from '@/lib/database/folder.schema';
import { DRIZZLE } from '@/lib/database/database.module';
import type { Database } from '@/lib/database/database.module';

@Injectable()
export class FolderReadRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: Database,
  ) {}

  async findRootsByOwner(ownerId: string): Promise<schema.Folder[]> {
    return this.db
      .select()
      .from(schema.folders)
      .where(
        and(
          eq(schema.folders.ownerId, ownerId),
          isNull(schema.folders.parentFolderId),
          eq(schema.folders.isDeleted, false),
        ),
      )
      .orderBy(
        asc(schema.folders.sortOrder),
        asc(schema.folders.createdAt),
        asc(schema.folders.id),
      );
  }

  async findChildren(
    ownerId: string,
    parentFolderId: string | null,
  ): Promise<schema.Folder[]> {
    return this.db
      .select()
      .from(schema.folders)
      .where(
        and(
          eq(schema.folders.ownerId, ownerId),
          parentFolderId === null
            ? isNull(schema.folders.parentFolderId)
            : eq(schema.folders.parentFolderId, parentFolderId),
          eq(schema.folders.isDeleted, false),
        ),
      )
      .orderBy(
        asc(schema.folders.sortOrder),
        asc(schema.folders.createdAt),
        asc(schema.folders.id),
      );
  }

  async findOneOwned(
    ownerId: string,
    id: string,
  ): Promise<schema.Folder | null> {
    const [row] = await this.db
      .select()
      .from(schema.folders)
      .where(
        and(
          eq(schema.folders.id, id),
          eq(schema.folders.ownerId, ownerId),
          eq(schema.folders.isDeleted, false),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async search(
    ownerId: string,
    query: string,
    parentFolderId: string | null | undefined,
  ): Promise<schema.Folder[]> {
    const parentClause =
      parentFolderId === undefined
        ? undefined
        : parentFolderId === null
          ? isNull(schema.folders.parentFolderId)
          : eq(schema.folders.parentFolderId, parentFolderId);

    return this.db
      .select()
      .from(schema.folders)
      .where(
        and(
          eq(schema.folders.ownerId, ownerId),
          eq(schema.folders.isDeleted, false),
          ilike(schema.folders.name, `%${query}%`),
          parentClause,
        ),
      )
      .orderBy(
        asc(schema.folders.sortOrder),
        asc(schema.folders.createdAt),
        asc(schema.folders.id),
      );
  }

  async getPath(
    ownerId: string,
    id: string,
  ): Promise<Array<{ id: string; name: string }>> {
    const result = await this.db.execute<{ id: string; name: string }>(sql`
      WITH RECURSIVE ancestors AS (
        SELECT "id", "name", "parentFolderId", 0 AS depth
          FROM folders
         WHERE "id" = ${id}
           AND "ownerId" = ${ownerId}
           AND "isDeleted" = false
        UNION ALL
        SELECT f."id", f."name", f."parentFolderId", a.depth + 1
          FROM folders f
          INNER JOIN ancestors a ON f."id" = a."parentFolderId"
         WHERE f."isDeleted" = false
           AND f."ownerId" = ${ownerId}
           AND a.depth < 64
      )
      SELECT "id", "name" FROM ancestors ORDER BY depth DESC;
    `);
    return result.rows.map((row) => ({ id: row.id, name: row.name }));
  }
}
