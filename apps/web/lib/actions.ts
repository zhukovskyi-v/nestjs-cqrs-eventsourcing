'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Folder, FileRecord, Permission } from '@/lib/types'

// ─── Folders ──────────────────────────────────────────────────────────────────

export async function getFolders(parentId: string | null): Promise<Folder[]> {
  const supabase = await createClient()
  const query = supabase
    .from('folders')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (parentId === null) {
    query.is('parent_id', null)
  } else {
    query.eq('parent_id', parentId)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function searchFolders(query: string, parentId: string | null): Promise<Folder[]> {
  const supabase = await createClient()
  const q = supabase
    .from('folders')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (parentId === null) {
    q.is('parent_id', null)
  } else {
    q.eq('parent_id', parentId)
  }

  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createFolder(name: string, parentId: string | null): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Place new folder at end
  const { count } = await supabase
    .from('folders')
    .select('*', { count: 'exact', head: true })
    .eq('parent_id', parentId ?? '')

  const { error } = await supabase.from('folders').insert({
    name,
    parent_id: parentId,
    owner_id: user.id,
    sort_order: count ?? 0,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/browse', 'page')
}

export async function updateFolder(id: string, name: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('folders')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/browse', 'page')
}

export async function cloneFolder(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: original, error: fetchError } = await supabase
    .from('folders')
    .select('*')
    .eq('id', id)
    .single()
  if (fetchError || !original) throw new Error('Folder not found')

  const { error } = await supabase.from('folders').insert({
    name: `${original.name} (copy)`,
    parent_id: original.parent_id,
    owner_id: user.id,
    sort_order: original.sort_order + 1,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/browse', 'page')
}

export async function deleteFolder(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('folders').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/browse', 'page')
}

export async function reorderFolders(
  updates: Array<{ id: string; sort_order: number }>
): Promise<void> {
  const supabase = await createClient()
  await Promise.all(
    updates.map(({ id, sort_order }) =>
      supabase.from('folders').update({ sort_order }).eq('id', id)
    )
  )
  revalidatePath('/browse', 'page')
}

export async function getFolderPath(folderId: string): Promise<Array<{ id: string; name: string }>> {
  const supabase = await createClient()
  const path: Array<{ id: string; name: string }> = []
  let currentId: string | null = folderId

  while (currentId) {
    const { data, error } = await supabase
      .from('folders')
      .select('id, name, parent_id')
      .eq('id', currentId)
      .single()

    if (error || !data) break
    path.unshift({ id: data.id, name: data.name })
    currentId = data.parent_id
  }

  return path
}

// ─── Files ────────────────────────────────────────────────────────────────────

export async function getFiles(folderId: string | null): Promise<FileRecord[]> {
  const supabase = await createClient()
  const query = supabase
    .from('files')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (folderId === null) {
    query.is('folder_id', null)
  } else {
    query.eq('folder_id', folderId)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function searchFiles(query: string, folderId: string | null): Promise<FileRecord[]> {
  const supabase = await createClient()
  const q = supabase
    .from('files')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (folderId === null) {
    q.is('folder_id', null)
  } else {
    q.eq('folder_id', folderId)
  }

  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createFileRecord(params: {
  name: string
  folderId: string | null
  blobUrl: string
  blobPathname: string
  isPublic: boolean
  size: number | null
  contentType: string | null
}): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { count } = await supabase
    .from('files')
    .select('*', { count: 'exact', head: true })
    .eq('folder_id', params.folderId ?? '')

  const { error } = await supabase.from('files').insert({
    name: params.name,
    folder_id: params.folderId,
    owner_id: user.id,
    blob_url: params.blobUrl,
    blob_pathname: params.blobPathname,
    is_public: params.isPublic,
    size: params.size,
    content_type: params.contentType,
    sort_order: count ?? 0,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/browse', 'page')
}

export async function updateFile(
  id: string,
  updates: { name?: string; is_public?: boolean }
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('files')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/browse', 'page')
}

export async function cloneFile(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: original, error: fetchError } = await supabase
    .from('files')
    .select('*')
    .eq('id', id)
    .single()
  if (fetchError || !original) throw new Error('File not found')

  const { error } = await supabase.from('files').insert({
    name: `${original.name} (copy)`,
    folder_id: original.folder_id,
    owner_id: user.id,
    blob_url: original.blob_url,
    blob_pathname: original.blob_pathname,
    is_public: original.is_public,
    size: original.size,
    content_type: original.content_type,
    sort_order: original.sort_order + 1,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/browse', 'page')
}

export async function deleteFile(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('files').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/browse', 'page')
}

export async function reorderFiles(
  updates: Array<{ id: string; sort_order: number }>
): Promise<void> {
  const supabase = await createClient()
  await Promise.all(
    updates.map(({ id, sort_order }) =>
      supabase.from('files').update({ sort_order }).eq('id', id)
    )
  )
  revalidatePath('/browse', 'page')
}

// ─── Permissions ──────────────────────────────────────────────────────────────

export async function getPermissions(resourceId: string): Promise<Permission[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('permissions')
    .select('*')
    .eq('resource_id', resourceId)
    .order('user_email')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function addPermission(params: {
  resourceId: string
  resourceType: 'folder' | 'file'
  userEmail: string
  role: 'viewer' | 'editor'
}): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('permissions').upsert({
    resource_id: params.resourceId,
    resource_type: params.resourceType,
    user_email: params.userEmail,
    role: params.role,
    granted_by: user.id,
  }, { onConflict: 'resource_id,user_email' })
  if (error) throw new Error(error.message)
}

export async function updatePermission(id: string, role: 'viewer' | 'editor'): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('permissions')
    .update({ role })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function removePermission(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('permissions').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
