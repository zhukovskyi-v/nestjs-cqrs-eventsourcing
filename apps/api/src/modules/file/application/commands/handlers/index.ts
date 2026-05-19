import { UploadFileHandler } from './upload-file.handler';
import { RenameFileHandler } from './rename-file.handler';
import { ChangeFileVisibilityHandler } from './change-file-visibility.handler';
import { ReorderFilesHandler } from './reorder-files.handler';
import { CloneFileHandler } from './clone-file.handler';
import { DeleteFileHandler } from './delete-file.handler';
import { MoveFileHandler } from './move-file.handler';

export const CommandHandlers = [
  UploadFileHandler,
  RenameFileHandler,
  ChangeFileVisibilityHandler,
  ReorderFilesHandler,
  CloneFileHandler,
  DeleteFileHandler,
  MoveFileHandler,
];
