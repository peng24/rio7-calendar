/**
 * Cloudflare Pages Functions: Reverse Proxy for Google Apps Script & Google Calendar iCal Feed
 * เส้นทาง: /api/*
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
  const url = new URL(request.url);

  // จัดการ CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-GAS-URL',
  };

  // ตอบกลับ OPTIONS Preflight ทันที
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // 1. Direct Google Calendar iCal Feed Proxy: /api/ical
  if (url.pathname.includes('/api/ical')) {
    try {
      const icsResponse = await fetch('https://calendar.google.com/calendar/ical/sarabun07%40gmail.com/public/basic.ics', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      const icsText = await icsResponse.text();
      return new Response(icsText, {
        status: 200,
        headers: {
          'Content-Type': 'text/calendar;charset=utf-8',
          'Cache-Control': 'public, max-age=60',
          ...corsHeaders,
        },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
  }

  // 2. Google Apps Script Web App Proxy: /api/gas หรือ /api/*
  const targetUrl = env.GAS_API_URL || request.headers.get('X-GAS-URL');

  if (!targetUrl) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'GAS_API_URL is not configured in Cloudflare environment variables.',
        offlineMode: true,
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
        offlineMode: true,
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
};
