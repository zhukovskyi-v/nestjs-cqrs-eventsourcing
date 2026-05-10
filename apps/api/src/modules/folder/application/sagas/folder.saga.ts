import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { filter, map, Observable } from 'rxjs';
import { FolderDeletedEvent } from '@/modules/folder/domain/events';

@Injectable()
export class FolderSaga {
  @Saga()
  folderDeleted = (events$: Observable<any>): Observable<ICommand> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return events$.pipe(
      ofType(FolderDeletedEvent),
      // TODO: Emit DeleteAllFilesInFolderCommand when File domain is implemented
      filter(() => false),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      map(() => undefined as any),
    );
  };
}
