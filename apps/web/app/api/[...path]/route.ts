import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

const GO_API_URL = process.env.BACKEND_INTERNAL_URL || "http://localhost:4000";

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const path = await params.then((x) => x.path.join("/"));

  const url = new URL(`/api/${path}`, GO_API_URL);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  const rheaders = new Headers(request.headers);
  rheaders.delete("host");

  try {
    const requestHeaders = await headers();

    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (!session) {
      redirect("/login");
    }

    type GetToken = (args: { headers: Headers }) => Promise<{ token?: string }>;
    const getToken = (auth.api as unknown as { getToken: GetToken }).getToken;

    const tokenResponse = await getToken({
      headers: requestHeaders,
    });

    const jwtToken = tokenResponse?.token ?? null;

    rheaders.set("Authorization", `Bearer ${jwtToken}`);

    const response = await fetch(url.toString(), {
      method: request.method,
      headers: rheaders,
      body: request.body,
      duplex: "half",
    } as RequestInit);

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.delete("transfer-encoding");

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy request" },
      { status: 500 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const HEAD = handler;
export const OPTIONS = handler;
