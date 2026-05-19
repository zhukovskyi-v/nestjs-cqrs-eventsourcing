import { FileBrowser } from "@/components/file-manager/file-browser";

interface BrowseFolderPageProps {
  params: Promise<{ folderId: string }>;
}

export default async function BrowseFolderPage({
  params,
}: BrowseFolderPageProps) {
  const { folderId } = await params;
  return <FileBrowser currentFolderId={folderId} />;
}
