import type {
  Folder as ContractFolder,
  File as ContractFile,
} from '@repo/contracts'

export type Folder = Omit<ContractFolder, 'createdAt' | 'updatedAt'> & {
  createdAt: string
  updatedAt: string
}

export type FileRecord = Omit<ContractFile, 'createdAt' | 'updatedAt'> & {
  createdAt: string
  updatedAt: string
}

export type Permission = {
  id: string
  resource_id: string
  resource_type: 'folder' | 'file'
  user_email: string
  role: 'viewer' | 'editor'
  granted_by: string
  created_at: string
}

export type BreadcrumbItem = {
  id: string | null
  name: string
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const ALLOWED_IMAGE_EXTENSIONS = '.jpg,.jpeg,.png,.webp'
export const ALLOWED_IMAGE_LABEL = 'JPEG, PNG, WebP'
