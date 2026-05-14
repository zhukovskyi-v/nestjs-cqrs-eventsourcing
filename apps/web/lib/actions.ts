'use server'

import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth/server'
import type { Permission } from '@/lib/types'

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
  const session = await getServerSession()
  if (!session) throw new Error('Not authenticated')
  const user = session.user

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
