'use client'

import { useState, useRef, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { CloudUpload, X, ImageIcon } from 'lucide-react'
import { useUploadFile } from '@/lib/hooks/use-files'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_EXTENSIONS, ALLOWED_IMAGE_LABEL } from '@/lib/types'

interface UploadFileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folderId: string | null
}

export function UploadFileDialog({
  open,
  onOpenChange,
  folderId,
}: UploadFileDialogProps) {
  const [isPublic, setIsPublic] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFileMutation = useUploadFile()

  function filterImages(files: File[]): { valid: File[]; rejected: string[] } {
    const valid: File[] = []
    const rejected: string[] = []
    for (const f of files) {
      if (ALLOWED_IMAGE_TYPES.includes(f.type as typeof ALLOWED_IMAGE_TYPES[number])) {
        valid.push(f)
      } else {
        rejected.push(f.name)
      }
    }
    return { valid, rejected }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const { valid, rejected } = filterImages(Array.from(e.target.files))
    if (rejected.length) toast.error(`Skipped non-image files: ${rejected.join(', ')}`)
    setSelectedFiles(valid)
    // reset input so the same file can be re-selected after removal
    e.target.value = ''
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const { valid, rejected } = filterImages(Array.from(e.dataTransfer.files))
    if (rejected.length) toast.error(`Skipped non-image files: ${rejected.join(', ')}`)
    setSelectedFiles((prev) => [...prev, ...valid])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function uploadFile(file: File): Promise<void> {
    await uploadFileMutation.mutateAsync({
      file,
      folderId,
      isPublic,
      name: file.name,
    })
  }

  async function handleSave() {
    if (selectedFiles.length === 0) return

    setIsUploading(true)
    try {
      await Promise.all(selectedFiles.map(uploadFile))
      toast.success(
        selectedFiles.length === 1
          ? `"${selectedFiles[0].name}" uploaded`
          : `${selectedFiles.length} files uploaded`
      )
      setSelectedFiles([])
      setIsPublic(false)
      onOpenChange(false)
    } catch {
      toast.error('One or more uploads failed')
    } finally {
      setIsUploading(false)
    }
  }

  function handleClose() {
    if (!isUploading) {
      setSelectedFiles([])
      setIsPublic(false)
      onOpenChange(false)
    }
  }

  const isPending = isUploading

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>File Upload</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground -mt-2">
          Images only — {ALLOWED_IMAGE_LABEL}
        </p>

        <div className="py-4 flex flex-col gap-4">
          {/* Is public checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="is-public"
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(!!checked)}
              disabled={isPending}
            />
            <Label htmlFor="is-public" className="text-sm cursor-pointer">
              Is public
            </Label>
          </div>

          {/* File input */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_IMAGE_EXTENSIONS}
              onChange={handleFileChange}
              className="hidden"
              id="file-upload-input"
              disabled={isPending}
            />
            <Label
              htmlFor="file-upload-input"
              className="flex-1 border border-input bg-background rounded-md px-3 py-2 text-sm text-muted-foreground cursor-pointer hover:bg-accent/50 transition-colors truncate"
            >
              {selectedFiles.length > 0
                ? `${selectedFiles.length} file(s) selected`
                : 'File upload'}
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
            >
              Choose...
            </Button>
          </div>

          {/* Selected files list */}
          {selectedFiles.length > 0 && (
            <ul className="flex flex-col gap-1 max-h-36 overflow-y-auto">
              {selectedFiles.map((file, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                  <ImageIcon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="flex-1 truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label={`Remove ${file.name}`}
                    disabled={isPending}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              'border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 py-10 transition-colors cursor-pointer',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-accent/30'
            )}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            aria-label="Drop files to upload"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          >
            <CloudUpload className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              Drop images to upload
            </p>
            <p className="text-xs text-muted-foreground/70">{ALLOWED_IMAGE_LABEL}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending || selectedFiles.length === 0}>
            {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
