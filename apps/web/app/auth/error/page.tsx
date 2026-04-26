export default function AuthErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="border border-border rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-lg font-semibold text-foreground mb-2">Authentication Error</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Something went wrong during sign in. Please try again.
        </p>
        <a
          href="/auth/login"
          className="text-sm text-primary underline underline-offset-4"
        >
          Back to sign in
        </a>
      </div>
    </main>
  )
}
