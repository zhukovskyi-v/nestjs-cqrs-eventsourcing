"use client";

import { FC } from "react";
import { FolderPlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFileBrowserStore } from "@/store/file-browser-store";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SearchBar: FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  const { openCreateFolder, openUploadDialog } = useFileBrowserStore();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-1 gap-2 min-w-0">
        <Input
          placeholder="Search files and folders..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-md"
          aria-label="Search input"
        />
        {searchQuery && (
          <Button
            onClick={() => onSearchChange("")}
            variant="outline"
            size="sm"
          >
            Clear
          </Button>
        )}
      </div>
      <div className="flex gap-2">
        <Button onClick={openCreateFolder} variant="outline" size="sm">
          <FolderPlus className="w-4 h-4 mr-2" />
          New Folder
        </Button>
        <Button onClick={openUploadDialog} size="sm">
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>
    </div>
  );
};
