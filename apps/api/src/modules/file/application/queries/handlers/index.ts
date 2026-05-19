import { GetFileHandler } from './get-file.handler';
import { GetFilesByFolderHandler } from './get-files-by-folder.handler';
import { SearchFilesHandler } from './search-files.handler';
import { GetFileHistoryHandler } from './get-file-history.handler';

export const QueryHandlers = [
  GetFileHandler,
  GetFilesByFolderHandler,
  SearchFilesHandler,
  GetFileHistoryHandler,
];
