import { Module, OnModuleInit } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FolderController } from './interface/folder.controller';
import { FolderRepository } from './infrastructure/repositories/folder.repository';
import { FolderProjection } from './infrastructure/projections/folder.projection';
import { FolderReadRepository } from './infrastructure/projections/folder-read.repository';
import { CommandHandlers } from './application/commands/handlers';
import { QueryHandlers } from './application/queries/handlers';
import { FolderSaga } from './application/sagas/folder.saga';
import { EventSerializer } from '@/lib/shared/infrastructure/eventstore/event-serializer';
import { registerFolderEvents } from './domain/events';

@Module({
  imports: [CqrsModule],
  controllers: [FolderController],
  providers: [
    FolderRepository,
    FolderProjection,
    FolderReadRepository,
    ...CommandHandlers,
    ...QueryHandlers,
    FolderSaga,
  ],
})
export class FolderModule implements OnModuleInit {
  constructor(private readonly eventSerializer: EventSerializer) {}

  onModuleInit(): void {
    registerFolderEvents(this.eventSerializer);
  }
}
