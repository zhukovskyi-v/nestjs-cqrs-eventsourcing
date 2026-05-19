import { Controller, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Implement, ORPCError, implement } from '@orpc/nest';
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { fileContract } from '@repo/contracts';

import type { Auth } from '@/modules/auth/auth';
import { ChangeFileVisibilityCommand } from '../application/commands/change-file-visibility.command';
import { CloneFileCommand } from '../application/commands/clone-file.command';
import { DeleteFileCommand } from '../application/commands/delete-file.command';
import { MoveFileCommand } from '../application/commands/move-file.command';
import { RenameFileCommand } from '../application/commands/rename-file.command';
import { ReorderFilesCommand } from '../application/commands/reorder-files.command';
import { UploadFileCommand } from '../application/commands/upload-file.command';
import { GetFileQuery } from '../application/queries/get-file.query';
import {
  FileHistoryEntry,
  GetFileHistoryQuery,
} from '../application/queries/get-file-history.query';
import { GetFilesByFolderQuery } from '../application/queries/get-files-by-folder.query';
import { SearchFilesQuery } from '../application/queries/search-files.query';

type Session = UserSession<Auth>;

@Controller()
@UseGuards(AuthGuard)
export class FileController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Implement(fileContract.upload)
  upload(@Session() session: Session) {
    return implement(fileContract.upload).handler(async ({ input }) => {
      const id = await this.commandBus.execute<UploadFileCommand, string>(
        new UploadFileCommand(
          input.file,
          input.name?.trim() || input.file.name,
          session.user.id,
          input.folderId ?? null,
          false,
        ),
      );

      return { id };
    });
  }

  @Implement(fileContract.findOne)
  findOne(@Session() session: Session) {
    return implement(fileContract.findOne).handler(async ({ input }) => {
      const file = await this.queryBus.execute(
        new GetFileQuery(input.id, session.user.id),
      );
      if (!file) {
        throw new ORPCError('NOT_FOUND', {
          message: `File ${input.id} not found`,
        });
      }
      return file;
    });
  }

  @Implement(fileContract.find)
  find(@Session() session: Session) {
    return implement(fileContract.find).handler(({ input }) => {
      return this.queryBus.execute(
        new GetFilesByFolderQuery(session.user.id, input.folderId ?? null),
      );
    });
  }

  @Implement(fileContract.search)
  search(@Session() session: Session) {
    return implement(fileContract.search).handler(({ input }) => {
      return this.queryBus.execute(
        new SearchFilesQuery(session.user.id, input.query, input.folderId),
      );
    });
  }

  @Implement(fileContract.rename)
  rename(@Session() session: Session) {
    return implement(fileContract.rename).handler(async ({ input }) => {
      await this.commandBus.execute(
        new RenameFileCommand(input.id, input.name, session.user.id),
      );
    });
  }

  @Implement(fileContract.changeVisibility)
  changeVisibility(@Session() session: Session) {
    return implement(fileContract.changeVisibility).handler(
      async ({ input }) => {
        await this.commandBus.execute(
          new ChangeFileVisibilityCommand(
            input.id,
            input.isPublic,
            session.user.id,
          ),
        );
      },
    );
  }

  @Implement(fileContract.clone)
  clone(@Session() session: Session) {
    return implement(fileContract.clone).handler(async ({ input }) => {
      const id = await this.commandBus.execute<CloneFileCommand, string>(
        new CloneFileCommand(input.id, session.user.id),
      );
      return { id };
    });
  }

  @Implement(fileContract.reorder)
  reorder(@Session() session: Session) {
    return implement(fileContract.reorder).handler(async ({ input }) => {
      await this.commandBus.execute(
        new ReorderFilesCommand(
          session.user.id,
          input.folderId,
          input.orderedIds,
        ),
      );
    });
  }

  @Implement(fileContract.delete)
  delete(@Session() session: Session) {
    return implement(fileContract.delete).handler(async ({ input }) => {
      await this.commandBus.execute(
        new DeleteFileCommand(input.id, session.user.id),
      );
    });
  }

  @Implement(fileContract.move)
  move(@Session() session: Session) {
    return implement(fileContract.move).handler(async ({ input }) => {
      await this.commandBus.execute(
        new MoveFileCommand(input.id, input.folderId, session.user.id),
      );
    });
  }

  @Implement(fileContract.getHistory)
  getHistory(@Session() session: Session) {
    return implement(fileContract.getHistory).handler(async ({ input }) => {
      return this.queryBus.execute<GetFileHistoryQuery, FileHistoryEntry[]>(
        new GetFileHistoryQuery(input.id, session.user.id),
      );
    });
  }
}
