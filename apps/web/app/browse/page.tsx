import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FileBrowser } from "@/components/file-manager/file-browser";
import { FolderOpen, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions";

export default async function BrowsePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/auth/login");
  }

  const isAnonymous = user.is_anonymous ?? false;
  const userEmail = user.email ?? "";

  const handleSignOut = async () => {
    "use server";
    await signOut();
  };

  return (
    <>
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-primary" />
            <span className="font-semibold text-foreground">CQRS Files</span>
          </div>
          <div className="flex items-center gap-2">
            {isAnonymous ? (
              <span className="text-sm text-muted-foreground hidden sm:flex items-center gap-1.5">
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground border border-border">
                  Guest
                </span>
              </span>
            ) : (
              <span className="text-sm text-muted-foreground hidden sm:block">
                {userEmail}
              </span>
            )}
            <form action={handleSignOut}>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                aria-label={isAnonymous ? "Exit guest session" : "Sign out"}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>
      <FileBrowser
        currentUserId={user.id}
        userEmail={userEmail}
        isAnonymous={isAnonymous}
      />
    </>
  );
}
