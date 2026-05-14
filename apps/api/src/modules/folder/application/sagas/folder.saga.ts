import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { from, mergeMap, Observable } from 'rxjs';
import { FolderDeletedEvent } from '@/modules/folder/domain/events';
import { FileReadRepository } from '@/modules/file/infrastructure/projections/file-read.repository';
import { DeleteFileCommand } from '@/modules/file/application/commands/delete-file.command';
import { FolderReadRepository } from '../../infrastructure/projections/folder-read.repository';
import { DeleteFolderCommand } from '@/modules/folder/application/commands/delete-folder.command';

@Injectable()
export class FolderSaga {
  constructor(
    private readonly folderReadRepository: FolderReadRepository,
    private readonly fileReadRepository: FileReadRepository,
  ) {}

  @Saga()
  folderDeleted = (events$: Observable<unknown>): Observable<ICommand> =>
    events$.pipe(
      ofType(FolderDeletedEvent),
      mergeMap(async (event: FolderDeletedEvent) => {
        const ownerId = event.ownerId;
        const folderId = event.aggregateId;
        const [children, files] = await Promise.all([
          this.folderReadRepository.findChildren(ownerId, folderId),
          this.fileReadRepository.findByFolder(ownerId, folderId),
        ]);

        const commands: ICommand[] = [
          ...children.map((c) => new DeleteFolderCommand(c.id, ownerId)),
          ...files.map((f) => new DeleteFileCommand(f.id, ownerId)),
        ];
        return commands;
      }),
      mergeMap((command) => from(command)),
    );
}
