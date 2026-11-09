import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ path: string[] }> };

async function forward(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const apiBase = path[0] === "contact" || path[0] === "admin"
    ? process.env.BLOG_CONTACT_API_PROXY_URL ?? "http://localhost:8081/api"
    : process.env.BLOG_API_PROXY_URL ?? "http://localhost:8081/api";
  const incoming = new URL(request.url);
  const upstreamUrl = `${apiBase}/${path.map(encodeURIComponent).join("/")}${incoming.search}`;
  const headers = new Headers();
  for (const name of ["authorization", "content-type", "accept"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();

  try {
    const upstream = await fetch(upstreamUrl, { method: request.method, headers, body, cache: "no-store", redirect: "manual" });
    const responseHeaders = new Headers();
    for (const name of ["content-type", "cache-control", "www-authenticate"]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return Response.json({ message: "The blog API is unavailable. Start the backend and try again." }, { status: 502 });
  }
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
