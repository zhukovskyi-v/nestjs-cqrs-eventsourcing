import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsUUID()
  ownerId: string;

  @IsUUID()
  @IsOptional()
  parentFolderId?: string | null;
}
