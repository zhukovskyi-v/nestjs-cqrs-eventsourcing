import { Global, Module } from '@nestjs/common';
import { EventStoreClientProvider } from './infrastructure/eventstore/eventstore.provider';
import { EventSerializer } from './infrastructure/eventstore/event-serializer';

@Global()
@Module({
  providers: [EventStoreClientProvider, EventSerializer],
  exports: [EventStoreClientProvider, EventSerializer],
})
export class SharedModule {}
