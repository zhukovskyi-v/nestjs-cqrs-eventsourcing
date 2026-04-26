export type Folder = {
  id: string
  name: string
  parent_id: string | null
  owner_id: string
  sort_order: number
  created_at: string
  updated_at: string
}

export type FileRecord = {
  id: string
  name: string
  folder_id: string | null
  owner_id: string
  blob_url: string
  blob_pathname: string
  is_public: boolean
  size: number | null
  content_type: string | null
  sort_order: number
  created_at: string
  updated_at: string
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
