"use client";

import { FC, Fragment } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileActivityList } from "./file-activity-list";
import { ShareLinkSection } from "./share-link-section";
import { formatSize } from "@/lib/utils";
import type { BreadcrumbItem, FileRecord } from "@/lib/types";

interface FileDetailsPanelProps {
  file: FileRecord;
  folderPath: BreadcrumbItem[];
  isOwner: boolean;
  ownerEmail?: string | null;
}

function formatDate(value: string | Date | undefined | null) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

export const FileDetailsPanel: FC<FileDetailsPanelProps> = ({
  file,
  folderPath,
  isOwner,
  ownerEmail,
}) => {
  return (
    <Tabs defaultValue="details" className="flex flex-col h-full">
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-4 mt-4">
        <dl className="space-y-3">
          <Row label="Type">
            <Badge variant="secondary" className="font-normal">
              {file.contentType ?? "Unknown"}
            </Badge>
          </Row>
          <Row label="Size">{formatSize(file.size) || "—"}</Row>
          <Row label="Location">
            <div className="flex flex-wrap items-center gap-1 text-sm">
              <Link
                href="/browse"
                className="text-muted-foreground hover:text-foreground"
              >
                Root
              </Link>
              {folderPath.map((item, i) => (
                <Fragment key={item.id ?? `crumb-${i}`}>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  {item.id ? (
                    <Link
                      href={`/browse/${item.id}`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <span className="text-foreground">{item.name}</span>
                  )}
                </Fragment>
              ))}
            </div>
          </Row>
          <Row label="Owner">
            {isOwner ? (
              <span className="text-sm">
                {ownerEmail ? `You · ${ownerEmail}` : "You"}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                {ownerEmail ?? "Someone else"}
              </span>
            )}
          </Row>
          <Row label="Created">{formatDate(file.createdAt)}</Row>
          <Row label="Updated">{formatDate(file.updatedAt)}</Row>
        </dl>

        <ShareLinkSection file={file} isOwner={isOwner} />
      </TabsContent>

      <TabsContent value="activity" className="mt-4">
        <FileActivityList fileId={file.id} />
      </TabsContent>
    </Tabs>
  );
};

interface RowProps {
  label: string;
  children: React.ReactNode;
}

const Row: FC<RowProps> = ({ label, children }) => (
  <div className="grid grid-cols-[6.5rem_1fr] items-start gap-3 py-1.5">
    <dt className="text-xs uppercase tracking-wide text-muted-foreground pt-0.5">
      {label}
    </dt>
    <dd className="text-sm text-foreground min-w-0">{children}</dd>
  </div>
);
