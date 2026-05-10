import { cookies, headers } from 'next/headers'

export type ServerSession = {
  user: {
    id: string
    email: string | null
    name: string | null
    image: string | null
    isAnonymous: boolean
  }
  session: {
    id: string
    token: string
    expiresAt: string
    userId: string
  }
}

export async function getServerSession(): Promise<ServerSession | null> {
  const cookieStore = await cookies()
  const headerStore = await headers()
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  const host = headerStore.get('host')
  const protocol = headerStore.get('x-forwarded-proto') ?? 'http'
  const origin =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (host ? `${protocol}://${host}` : 'http://localhost:3001')

  try {
    const res = await fetch(`${origin}/api/auth/get-session`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = (await res.json()) as ServerSession | null
    return data && data.user ? data : null
  } catch {
    return null
  }
}
