import { GetFileHandler } from './get-file.handler';
import { GetFilesByFolderHandler } from './get-files-by-folder.handler';
import { SearchFilesHandler } from './search-files.handler';

export const QueryHandlers = [
  GetFileHandler,
  GetFilesByFolderHandler,
  SearchFilesHandler,
];
