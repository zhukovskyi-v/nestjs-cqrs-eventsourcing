import { GetFolderHandler } from './get-folder.handler';
import { GetFoldersByParentHandler } from './get-folders-by-parent.handler';
import { GetRootFoldersHandler } from './get-root-folders.handler';
import { SearchFoldersHandler } from './search-folders.handler';
import { GetFolderPathHandler } from './get-folder-path.handler';

export const QueryHandlers = [
  GetFolderHandler,
  GetFoldersByParentHandler,
  GetRootFoldersHandler,
  SearchFoldersHandler,
  GetFolderPathHandler,
];
