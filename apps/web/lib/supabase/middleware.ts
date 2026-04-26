import {createServerClient} from '@supabase/ssr'
import {NextResponse, type NextRequest} from 'next/server'


export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({request})

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({name, value}) =>
                        request.cookies.set(name, value),
                    )
                    supabaseResponse = NextResponse.next({request})
                    cookiesToSet.forEach(({name, value, options}) =>
                        supabaseResponse.cookies.set(name, value, options),
                    )
                },
            },
        },
    )

    const {
        data: {user},
    } = await supabase.auth.getUser()

    const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
    const isBrowsePage = request.nextUrl.pathname.startsWith('/browse') || request.nextUrl.pathname === '/'

    if (isBrowsePage && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        return NextResponse.redirect(url)
    }

    if (isAuthPage && user) {
        const url = request.nextUrl.clone()
        url.pathname = '/browse'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
