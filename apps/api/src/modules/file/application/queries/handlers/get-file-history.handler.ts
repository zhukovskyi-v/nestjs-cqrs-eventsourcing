import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  BACKWARDS,
  END,
  EventStoreDBClient,
  StreamNotFoundError,
} from '@eventstore/db-client';
import { ORPCError } from '@orpc/nest';
import { EVENTSTORE_CLIENT } from '@/lib/shared/infrastructure/eventstore/eventstore.constants';
import { FileReadRepository } from '../../../infrastructure/projections/file-read.repository';
import {
  FileHistoryEntry,
  GetFileHistoryQuery,
} from '../get-file-history.query';

@QueryHandler(GetFileHistoryQuery)
export class GetFileHistoryHandler implements IQueryHandler<GetFileHistoryQuery> {
  constructor(
    @Inject(EVENTSTORE_CLIENT)
    private readonly client: EventStoreDBClient,
    private readonly files: FileReadRepository,
  ) {}

  async execute(query: GetFileHistoryQuery): Promise<FileHistoryEntry[]> {
    const file = await this.files.findOneOwned(query.ownerId, query.fileId);

    if (!file) {
      throw new ORPCError('NOT_FOUND', {
        message: `File ${query.fileId} not found`,
      });
    }

    const stream = `file-${query.fileId}`;
    const entries: FileHistoryEntry[] = [];

    try {
      const resolved = this.client.readStream(stream, {
        direction: BACKWARDS,
        fromRevision: END,
      });

      for await (const resolvedEvent of resolved) {
        const raw = resolvedEvent.event;
        if (!raw) continue;

        const data = (raw.data ?? {}) as Record<string, unknown>;
        const metadata = (raw.metadata ?? {}) as Record<string, unknown>;
        const occurredOn =
          typeof metadata.occurredOn === 'string'
            ? metadata.occurredOn
            : new Date(Number(raw.created) / 10000).toISOString();

        const summary = this.buildSummary(raw.type, data);
        if (!summary) continue;

        entries.push({
          eventType: raw.type,
          occurredOn,
          summary,
          payload: data,
        });
      }
    } catch (error) {
      if (error instanceof StreamNotFoundError) {
        return [];
      }
      throw error;
    }

    return entries;
  }

  private buildSummary(
    type: string,
    data: Record<string, unknown>,
  ): string | null {
    switch (type) {
      case 'FileCreated':
        return 'Created';
      case 'FileRenamed':
        return typeof data.newName === 'string'
          ? `Renamed to "${data.newName}"`
          : 'Renamed';
      case 'FileVisibilityChanged':
        return data.isPublic ? 'Made public' : 'Made private';
      case 'FileMoved':
        return data.newFolderId ? 'Moved to another folder' : 'Moved to root';
      case 'FileCloned':
        return 'Cloned from another file';
      case 'FileDeleted':
        return 'Deleted';
      case 'FileSortOrderChanged':
        return null;
      default:
        return null;
    }
  }
}
