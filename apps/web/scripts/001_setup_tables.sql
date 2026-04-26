-- Create folders table
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Owner full access
CREATE POLICY "folders_owner_all" ON public.folders
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.permissions p
      WHERE p.resource_id = id AND p.resource_type = 'folder' AND p.user_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

-- Create files table
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blob_url TEXT NOT NULL,
  blob_pathname TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  size BIGINT,
  content_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "files_owner_all" ON public.files
  USING (
    owner_id = auth.uid()
    OR is_public = true
    OR EXISTS (
      SELECT 1 FROM public.permissions p
      WHERE p.resource_id = id AND p.resource_type = 'file' AND p.user_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('folder', 'file')),
  user_email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('viewer', 'editor')),
  granted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (resource_id, user_email)
);

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "permissions_owner_manage" ON public.permissions
  USING (granted_by = auth.uid())
  WITH CHECK (granted_by = auth.uid());

CREATE POLICY "permissions_shared_read" ON public.permissions
  FOR SELECT
  USING (
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR granted_by = auth.uid()
  );
