/**
 * Cloudflare Pages Functions: Reverse Proxy for Google Apps Script
 * เส้นทาง: /api/*
 * ทำหน้าที่เป็นตัวกลางในการส่งต่อ Request ไปยัง Google Apps Script Web App
 */

interface Env {
  GAS_API_URL?: string;
}

interface RequestContext {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
}

export const onRequest = async (context: RequestContext): Promise<Response> => {
  const { request, env } = context;

  // จัดการ CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // ตอบกลับ OPTIONS Preflight ทันที
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // ดึง URL ของ Google Apps Script จาก Environment Variable หรือ Header
  const targetUrl = env.GAS_API_URL || request.headers.get('X-GAS-URL');

  if (!targetUrl) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'GAS_API_URL is not configured in Cloudflare environment variables.',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }

  try {
    let body: any = null;
    if (request.method === 'POST') {
      body = await request.text();
    }

    const gasResponse = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: body,
      redirect: 'follow',
    });

    const responseText = await gasResponse.text();

    return new Response(responseText, {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        ...corsHeaders,
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || 'Error proxying request to Google Apps Script',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};
