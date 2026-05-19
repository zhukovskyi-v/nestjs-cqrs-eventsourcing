import { FC, PropsWithChildren } from "react";
import { FolderOpen } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getServerSession } from "@/lib/auth/server";
import { redirect } from "next/navigation";

const Layout: FC<PropsWithChildren> = async ({ children }) => {
  const session = await getServerSession();
  if (!session) {
    return redirect("/auth/login");
  }

  const { user } = session;
  const isAnonymous = user.isAnonymous ?? false;
  const userEmail = user.email ?? "";
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
            <SignOutButton
              ariaLabel={isAnonymous ? "Exit guest session" : "Sign out"}
            />
          </div>
        </div>
      </header>
      {children}
    </>
  );
};

export default Layout;
