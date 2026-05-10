import { registerAs } from '@nestjs/config';

export const eventstoreConfig = registerAs('eventstore', () => ({
  connectionString: process.env.EVENTSTORE_CONNECTION_STRING,
}));
