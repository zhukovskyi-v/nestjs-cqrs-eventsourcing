import { forwardRef, Module, OnModuleInit } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FileController } from './interface/file.controller';
import { FileRepository } from './infrastructure/repositories/file.repository';
import { FileProjection } from './infrastructure/projections/file.projection';
import { FileReadRepository } from './infrastructure/projections/file-read.repository';
import { CloudinaryEventHandler } from './infrastructure/event-handlers/cloudinary.event-handler';
import { CommandHandlers } from './application/commands/handlers';
import { QueryHandlers } from './application/queries/handlers';
import { FileSaga } from './application/sagas/file.saga';
import { EventSerializer } from '@/lib/shared/infrastructure/eventstore/event-serializer';
import { registerFileEvents } from './domain/events';
import { FolderModule } from '@/modules/folder/folder.module';

@Module({
  imports: [CqrsModule, forwardRef(() => FolderModule)],
  controllers: [FileController],
  providers: [
    FileRepository,
    FileProjection,
    FileReadRepository,
    CloudinaryEventHandler,
    ...CommandHandlers,
    ...QueryHandlers,
    FileSaga,
  ],
  exports: [FileReadRepository],
})
export class FileModule implements OnModuleInit {
  constructor(private readonly eventSerializer: EventSerializer) {}

  onModuleInit(): void {
    registerFileEvents(this.eventSerializer);
  }
}
