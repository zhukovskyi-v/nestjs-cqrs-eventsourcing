import { IsOptional, IsUUID } from 'class-validator';

export class MoveFolderDto {
  @IsUUID()
  @IsOptional()
  newParentFolderId?: string | null;
}
