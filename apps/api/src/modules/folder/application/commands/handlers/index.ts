import { CreateFolderHandler } from './create-folder.handler';
import { RenameFolderHandler } from './rename-folder.handler';
import { MoveFolderHandler } from './move-folder.handler';
import { DeleteFolderHandler } from './delete-folder.handler';
import { CloneFolderHandler } from './clone-folder.handler';
import { ReorderFoldersHandler } from './reorder-folders.handler';

export const CommandHandlers = [
  CreateFolderHandler,
  RenameFolderHandler,
  MoveFolderHandler,
  DeleteFolderHandler,
  CloneFolderHandler,
  ReorderFoldersHandler,
];
