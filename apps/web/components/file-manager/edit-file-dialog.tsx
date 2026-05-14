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
import { Checkbox } from '@/components/ui/checkbox'
import { Spinner } from '@/components/ui/spinner'
import { useRenameFile, useChangeFileVisibility } from '@/lib/hooks/use-files'
import type { FileRecord } from '@/lib/types'

interface EditFileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: FileRecord | null
}

export function EditFileDialog({ open, onOpenChange, file }: EditFileDialogProps) {
  const [name, setName] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  const renameMutation = useRenameFile()
  const visibilityMutation = useChangeFileVisibility()
  const isPending = renameMutation.isPending || visibilityMutation.isPending

  useEffect(() => {
    if (open && file) {
      setName(file.name)
      setIsPublic(file.isPublic)
    }
  }, [open, file])

  async function handleSave() {
    const trimmed = name.trim()
    if (!trimmed || !file) return

    const tasks: Promise<unknown>[] = []
    if (trimmed !== file.name) {
      tasks.push(renameMutation.mutateAsync({ id: file.id, name: trimmed }))
    }
    if (isPublic !== file.isPublic) {
      tasks.push(
        visibilityMutation.mutateAsync({ id: file.id, isPublic }),
      )
    }
    if (tasks.length === 0) {
      onOpenChange(false)
      return
    }

    try {
      await Promise.all(tasks)
      onOpenChange(false)
    } catch {
      // toast handled by hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit File</DialogTitle>
        </DialogHeader>

        <div className="py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="file-name">File name</Label>
            <Input
              id="file-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
              disabled={isPending}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="file-public"
              checked={isPublic}
              onCheckedChange={(v) => setIsPublic(!!v)}
              disabled={isPending}
            />
            <Label htmlFor="file-public" className="text-sm cursor-pointer">
              Public (visible to everyone)
            </Label>
          </div>
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
