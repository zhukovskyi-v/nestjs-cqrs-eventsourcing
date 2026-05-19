import { Query } from '@nestjs/cqrs';

export interface FileHistoryEntry {
  eventType: string;
  occurredOn: string;
  summary: string;
  payload: Record<string, unknown>;
}

export class GetFileHistoryQuery extends Query<FileHistoryEntry[]> {
  constructor(
    public readonly fileId: string,
    public readonly ownerId: string,
  ) {
    super();
  }
}
