import { FileDetailPage } from "@/components/file-detail/file-detail-page";

interface FileDetailRouteProps {
  params: Promise<{ fileId: string }>;
}

export default async function FileDetailRoute({
  params,
}: FileDetailRouteProps) {
  const { fileId } = await params;
  return <FileDetailPage fileId={fileId} />;
}
