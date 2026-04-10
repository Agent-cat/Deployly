import { NextResponse, NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host')

  // Define our main domains
  const mainDomains = ['localhost:3000', 'vercel-clone.localhost:3000', 'klfemflare.in', '18.60.117.242.nip.io:3000']

  if (hostname && !mainDomains.includes(hostname)) {
    const isIP = /^[\d\.:]+$/.test(hostname)

    if (isIP) {
      return NextResponse.next()
    }

    // This is a subdomain (slug)
    const subdomain = hostname.split('.')[0]

    // Construct the S3 URL
    const BASE_PATH = "https://vishnu-vercel-output.s3.ap-south-2.amazonaws.com/__output"

    // Handle root path
    let path = request.nextUrl.pathname
    if (path === '/') path = '/index.html'

    const targetUrl = `${BASE_PATH}/${subdomain}${path}`

    // console.log(`Proxying ${hostname}${request.nextUrl.pathname} to ${targetUrl}`)

    // Rewrite the request to the external S3 URL
    // Next.js will proxy this request internally
    return NextResponse.rewrite(new URL(targetUrl))
  }

  // Otherwise, continue to the Next.js app
  return NextResponse.next()
}

// Config to specify which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
