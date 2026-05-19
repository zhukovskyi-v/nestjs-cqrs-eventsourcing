import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, ilike, isNull } from 'drizzle-orm';
import * as schema from '@/lib/database/file.schema';
import { DRIZZLE } from '@/lib/database/database.module';
import type { Database } from '@/lib/database/database.module';

@Injectable()
export class FileReadRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: Database,
  ) {}

  async findByFolder(
    ownerId: string,
    folderId: string | null,
  ): Promise<schema.File[]> {
    return this.db
      .select()
      .from(schema.files)
      .where(
        and(
          eq(schema.files.ownerId, ownerId),
          folderId === null
            ? isNull(schema.files.folderId)
            : eq(schema.files.folderId, folderId),
          eq(schema.files.isDeleted, false),
        ),
      )
      .orderBy(
        asc(schema.files.sortOrder),
        asc(schema.files.createdAt),
        asc(schema.files.id),
      );
  }

  async findOneOwned(ownerId: string, id: string): Promise<schema.File | null> {
    const [row] = await this.db
      .select()
      .from(schema.files)
      .where(
        and(
          eq(schema.files.id, id),
          eq(schema.files.ownerId, ownerId),
          eq(schema.files.isDeleted, false),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async search(
    ownerId: string,
    query: string,
    folderId: string | null | undefined,
  ): Promise<schema.File[]> {
    const folderClause =
      folderId === undefined
        ? undefined
        : folderId === null
          ? isNull(schema.files.folderId)
          : eq(schema.files.folderId, folderId);

    return this.db
      .select()
      .from(schema.files)
      .where(
        and(
          eq(schema.files.ownerId, ownerId),
          eq(schema.files.isDeleted, false),
          ilike(schema.files.name, `%${query}%`),
          folderClause,
        ),
      )
      .orderBy(
        asc(schema.files.sortOrder),
        asc(schema.files.createdAt),
        asc(schema.files.id),
      );
  }
}
