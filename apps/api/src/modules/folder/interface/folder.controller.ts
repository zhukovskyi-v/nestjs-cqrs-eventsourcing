import { Controller, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Implement, ORPCError, implement } from '@orpc/nest';
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { folderContract } from '@repo/contracts';

import type { Auth } from '@/modules/auth/auth';
import { CloneFolderCommand } from '../application/commands/clone-folder.command';
import { CreateFolderCommand } from '../application/commands/create-folder.command';
import { DeleteFolderCommand } from '../application/commands/delete-folder.command';
import { MoveFolderCommand } from '../application/commands/move-folder.command';
import { RenameFolderCommand } from '../application/commands/rename-folder.command';
import { ReorderFoldersCommand } from '../application/commands/reorder-folders.command';
import { GetFolderQuery } from '../application/queries/get-folder.query';
import { GetFolderPathQuery } from '../application/queries/get-folder-path.query';
import { GetFoldersByParentQuery } from '../application/queries/get-folders-by-parent.query';
import { GetRootFoldersQuery } from '../application/queries/get-root-folders.query';
import { SearchFoldersQuery } from '../application/queries/search-folders.query';

type Session = UserSession<Auth>;

@Controller()
@UseGuards(AuthGuard)
export class FolderController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Implement(folderContract.create)
  create(@Session() session: Session) {
    return implement(folderContract.create).handler(async ({ input }) => {
      const id = await this.commandBus.execute<CreateFolderCommand, string>(
        new CreateFolderCommand(
          input.name,
          session.user.id,
          input.parentFolderId ?? null,
        ),
      );
      return { id };
    });
  }

  @Implement(folderContract.search)
  search(@Session() session: Session) {
    return implement(folderContract.search).handler(({ input }) => {
      return this.queryBus.execute(
        new SearchFoldersQuery(
          session.user.id,
          input.query,
          input.parentFolderId,
        ),
      );
    });
  }

  @Implement(folderContract.reorder)
  reorder(@Session() session: Session) {
    return implement(folderContract.reorder).handler(async ({ input }) => {
      await this.commandBus.execute(
        new ReorderFoldersCommand(
          session.user.id,
          input.parentFolderId,
          input.orderedIds,
        ),
      );
    });
  }

  @Implement(folderContract.getPath)
  getPath(@Session() session: Session) {
    return implement(folderContract.getPath).handler(({ input }) => {
      return this.queryBus.execute(
        new GetFolderPathQuery(session.user.id, input.id),
      );
    });
  }

  @Implement(folderContract.findOne)
  findOne(@Session() session: Session) {
    return implement(folderContract.findOne).handler(async ({ input }) => {
      const folder = await this.queryBus.execute(
        new GetFolderQuery(input.id, session.user.id),
      );
      if (!folder) {
        throw new ORPCError('NOT_FOUND', {
          message: `Folder ${input.id} not found`,
        });
      }
      return folder;
    });
  }

  @Implement(folderContract.find)
  find(@Session() session: Session) {
    return implement(folderContract.find).handler(({ input }) => {
      if (!input.parentFolderId) {
        return this.queryBus.execute(new GetRootFoldersQuery(session.user.id));
      }
      return this.queryBus.execute(
        new GetFoldersByParentQuery(session.user.id, input.parentFolderId),
      );
    });
  }

  @Implement(folderContract.rename)
  rename(@Session() session: Session) {
    return implement(folderContract.rename).handler(async ({ input }) => {
      await this.commandBus.execute(
        new RenameFolderCommand(input.id, input.name, session.user.id),
      );
    });
  }

  @Implement(folderContract.move)
  move(@Session() session: Session) {
    return implement(folderContract.move).handler(async ({ input }) => {
      await this.commandBus.execute(
        new MoveFolderCommand(
          input.id,
          input.newParentFolderId ?? null,
          session.user.id,
        ),
      );
    });
  }

  @Implement(folderContract.clone)
  clone(@Session() session: Session) {
    return implement(folderContract.clone).handler(async ({ input }) => {
      const id = await this.commandBus.execute<CloneFolderCommand, string>(
        new CloneFolderCommand(input.id, session.user.id),
      );
      return { id };
    });
  }

  @Implement(folderContract.delete)
  delete(@Session() session: Session) {
    return implement(folderContract.delete).handler(async ({ input }) => {
      await this.commandBus.execute(
        new DeleteFolderCommand(input.id, session.user.id),
      );
    });
  }
}
