import { NextResponse, NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host')

  const mainDomains = ['localhost:3000', 'vercel-clone.localhost:3000', 'klfemflare.in', '18.60.117.242.nip.io:3000']

  if (hostname && !mainDomains.includes(hostname)) {
    const isIP = /^[\d\.:]+$/.test(hostname)

    if (isIP) {
      return NextResponse.next()
    }

    const subdomain = hostname.split('.')[0]

    const BASE_PATH = "https://vishnu-vercel-output.s3.ap-south-2.amazonaws.com/__output"

    let path = request.nextUrl.pathname
    if (path === '/') path = '/index.html'

    const targetUrl = `${BASE_PATH}/${subdomain}${path}`

    return NextResponse.rewrite(new URL(targetUrl))
  }

  return NextResponse.next()
}


export const config = {
  matcher: [

    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
