'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Mail, X } from 'lucide-react'
import {
  usePermissions,
  useAddPermission,
  useUpdatePermission,
  useRemovePermission,
} from '@/lib/hooks/use-permissions'
import { toast } from 'sonner'

interface PermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resourceId: string
  resourceType: 'folder' | 'file'
  resourceName: string
}

export function PermissionsDialog({
  open,
  onOpenChange,
  resourceId,
  resourceType,
  resourceName,
}: PermissionsDialogProps) {
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<'viewer' | 'editor'>('viewer')

  const { data: permissions = [], isLoading } = usePermissions(open ? resourceId : null)
  const addMutation = useAddPermission()
  const updateMutation = useUpdatePermission()
  const removeMutation = useRemovePermission()

  const isSaving = addMutation.isPending || updateMutation.isPending || removeMutation.isPending

  function handleAddEmail() {
    const email = newEmail.trim().toLowerCase()
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    if (permissions.some((p) => p.user_email === email)) {
      toast.error('This user already has access')
      return
    }

    addMutation.mutate(
      { resourceId, resourceType, userEmail: email, role: newRole },
      {
        onSuccess: () => {
          setNewEmail('')
        },
      }
    )
  }

  function handleRoleChange(permissionId: string, role: 'viewer' | 'editor') {
    updateMutation.mutate({ id: permissionId, role })
  }

  function handleRemove(permissionId: string) {
    removeMutation.mutate(permissionId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            Permissions for {resourceType}{' '}
            <span className="font-semibold">{resourceName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 flex flex-col gap-4">
          {/* Add new user */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="user@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
                className="pl-9"
                type="email"
                disabled={isSaving}
                aria-label="Email address to add"
              />
            </div>
            <Select
              value={newRole}
              onValueChange={(v) => setNewRole(v as 'viewer' | 'editor')}
              disabled={isSaving}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddEmail} disabled={isSaving || !newEmail.trim()} size="sm">
              Add
            </Button>
          </div>

          {/* Permissions list */}
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Spinner className="h-5 w-5" />
            </div>
          ) : permissions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No users have been granted access yet.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border border border-border rounded-md overflow-hidden">
              {permissions.map((perm) => (
                <li
                  key={perm.id}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-accent/30 transition-colors"
                >
                  <span className="flex-1 text-sm text-foreground truncate">
                    {perm.user_email}
                  </span>
                  <Select
                    value={perm.role}
                    onValueChange={(v) => handleRoleChange(perm.id, v as 'viewer' | 'editor')}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="w-26 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={() => handleRemove(perm.id)}
                    disabled={isSaving}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label={`Remove ${perm.user_email}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} disabled={isSaving}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
