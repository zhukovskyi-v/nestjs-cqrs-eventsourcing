import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventStoreDBClient } from '@eventstore/db-client';
import { EVENTSTORE_CLIENT } from './eventstore.constants';

export const EventStoreClientProvider: Provider = {
  provide: EVENTSTORE_CLIENT,
  useFactory: (configService: ConfigService): EventStoreDBClient => {
    const connectionString = configService.getOrThrow<string>(
      'eventstore.connectionString',
    );
    return EventStoreDBClient.connectionString(connectionString);
  },
  inject: [ConfigService],
};
