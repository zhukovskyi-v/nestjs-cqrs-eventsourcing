'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { useCreateFolder, useUpdateFolder } from '@/lib/hooks/use-folders'
import type { Folder } from '@/lib/types'

interface CreateFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parentId: string | null
  editingFolder: Folder | null
}

export function CreateFolderDialog({
  open,
  onOpenChange,
  parentId,
  editingFolder,
}: CreateFolderDialogProps) {
  const [name, setName] = useState('')
  const isEditing = !!editingFolder

  const createMutation = useCreateFolder()
  const updateMutation = useUpdateFolder()
  const isPending = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (open) {
      setName(editingFolder?.name ?? '')
    }
  }, [open, editingFolder])

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) return

    if (isEditing && editingFolder) {
      updateMutation.mutate(
        { id: editingFolder.id, name: trimmed },
        {
          onSuccess: () => {
            onOpenChange(false)
            setName('')
          },
        }
      )
    } else {
      createMutation.mutate(
        { name: trimmed, parentId },
        {
          onSuccess: () => {
            onOpenChange(false)
            setName('')
          },
        }
      )
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Folder' : 'Create Folder'}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="folder-name" className="sr-only">
            Folder name
          </Label>
          <Input
            id="folder-name"
            placeholder="Folder name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            disabled={isPending}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending || !name.trim()}>
            {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
