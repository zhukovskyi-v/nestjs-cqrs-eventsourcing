import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ORPCModule } from '@orpc/nest';
import { eventstoreConfig } from '@/lib/config/eventstore.config';
import { databaseConfig } from '@/lib/config/database.config';
import { DatabaseModule } from '@/lib/database/database.module';
import { SharedModule } from '@/lib/shared/shared.module';
import { FolderModule } from '@/modules/folder/folder.module';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from '@/modules/auth/auth';
import { DocsController } from '@/lib/docs/docs.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [eventstoreConfig, databaseConfig],
    }),
    ORPCModule.forRoot({}),
    DatabaseModule,
    SharedModule,
    AuthModule.forRoot({ auth, disableGlobalAuthGuard: true }),
    FolderModule,
  ],
  controllers: [DocsController],
})
export class AppModule {}
