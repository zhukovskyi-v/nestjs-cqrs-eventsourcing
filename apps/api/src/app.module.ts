import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ORPCModule } from '@orpc/nest';
import { eventstoreConfig } from '@/lib/config/eventstore.config';
import { databaseConfig } from '@/lib/config/database.config';
import { cloudinaryConfig } from '@/lib/config/cloudinary.config';
import { DatabaseModule } from '@/lib/database/database.module';
import { SharedModule } from '@/lib/shared/shared.module';
import { CloudinaryModule } from '@/lib/cloudinary/cloudinary.module';
import { FolderModule } from '@/modules/folder/folder.module';
import { FileModule } from '@/modules/file/file.module';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from '@/modules/auth/auth';
import { DocsController } from '@/lib/docs/docs.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [eventstoreConfig, databaseConfig, cloudinaryConfig],
    }),
    ORPCModule.forRoot({}),
    DatabaseModule,
    SharedModule,
    CloudinaryModule,
    AuthModule.forRoot({ auth, disableGlobalAuthGuard: true }),
    FolderModule,
    FileModule,
  ],
  controllers: [DocsController],
})
export class AppModule {}
