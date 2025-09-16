import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Temporarily disable middleware to debug authentication
  return NextResponse.next()
  
  // let response = NextResponse.next({
  //   request: {
  //     headers: request.headers,
  //   },
  // })

  // const supabase = createServerClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  //   {
  //     cookies: {
  //       get(name: string) {
  //         return request.cookies.get(name)?.value
  //       },
  //       set(name: string, value: string, options: Record<string, unknown>) {
  //         request.cookies.set({
  //           name,
  //           value,
  //           ...options,
  //         })
  //         response = NextResponse.next({
  //           request: {
  //             headers: request.headers,
  //           },
  //         })
  //         response.cookies.set({
  //           name,
  //           value,
  //           ...options,
  //         })
  //       },
  //       remove(name: string, options: Record<string, unknown>) {
  //         request.cookies.set({
  //           name,
  //           value: '',
  //           ...options,
  //         })
  //         response = NextResponse.next({
  //           request: {
  //             headers: request.headers,
  //           },
  //         })
  //         response.cookies.set({
  //           name,
  //           value: '',
  //           ...options,
  //         })
  //       },
  //     },
  //   }
  // )

  // const {
  //   data: { session },
  // } = await supabase.auth.getSession()

  // // If user is not signed in and the current path is protected, redirect to landing
  // if (!session && request.nextUrl.pathname === '/') {
  //   return NextResponse.redirect(new URL('/landing', request.url))
  // }

  // // If user is signed in and trying to access auth pages or landing, redirect to dashboard
  // if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup' || request.nextUrl.pathname === '/landing')) {
  //   return NextResponse.redirect(new URL('/', request.url))
  // }

  // return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
