const MAX_BODY_BYTES = 8 * 1024;
const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 50;
const REPORT_MAX_ROWS = 200;
const DAY_MS = 24 * 60 * 60 * 1000;

function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
}

function originFor(request, env) {
  const origin = request.headers.get('Origin') || '';
  return allowedOrigins(env).includes(origin) ? origin : '';
}

function corsHeaders(origin) {
  const headers = new Headers({
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Cache-Control': 'no-store',
    'Vary': 'Origin'
  });

  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
  }

  return headers;
}

function response(body, status, origin) {
  return new Response(status === 204 ? null : body, {
    status,
    headers: corsHeaders(origin)
  });
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=UTF-8'
    }
  });
}

function textField(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function normalizedPath(value) {
  const path = textField(value, 512);
  return path.startsWith('/') && !path.startsWith('//') ? path : '/';
}

async function recordVisit(request, env) {
  const origin = originFor(request, env);
  if (!origin) {
    return response('Forbidden', 403, '');
  }

  let input;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
      return response('Payload too large', 413, origin);
    }
    input = JSON.parse(body);
  } catch {
    return response('Invalid JSON', 400, origin);
  }

  const ip = textField(request.headers.get('CF-Connecting-IP'), 80);
  if (!ip) {
    return response('Missing client IP', 400, origin);
  }

  await env.DB.prepare(`
    INSERT INTO visit_logs
      (visited_at, ip, path, referrer, title, language, country, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    new Date().toISOString(),
    ip,
    normalizedPath(input.path),
    textField(input.referrer, 1024),
    textField(input.title, 200),
    textField(input.language, 32),
    textField(request.headers.get('CF-IPCountry'), 8),
    textField(request.headers.get('User-Agent'), 512)
  ).run();

  return response('', 204, origin);
}

function authorized(request, env) {
  const expected = String(env.VISITOR_LOG_ADMIN_TOKEN || '');
  const authorization = request.headers.get('Authorization') || '';
  return Boolean(expected) && authorization === `Bearer ${expected}`;
}

async function listLogs(request, env) {
  if (!authorized(request, env)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const url = new URL(request.url);
  const requestedLimit = Number.parseInt(url.searchParams.get('limit') || '', 10);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), MAX_LIMIT)
    : DEFAULT_LIMIT;
  const result = await env.DB.prepare(`
    SELECT id, visited_at, ip, path, referrer, title, language, country, user_agent
    FROM visit_logs
    ORDER BY visited_at DESC
    LIMIT ?
  `).bind(limit).all();

  return new Response(JSON.stringify({ logs: result.results }), {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=UTF-8'
    }
  });
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function reportText(rows, start, end) {
  const lines = [
    '博客访问日报',
    `时间范围：${start.toISOString()} 至 ${end.toISOString()}`,
    `展示记录：${rows.length}${rows.length === REPORT_MAX_ROWS ? '（最多展示 200 条，实际可能更多）' : ''}`,
    ''
  ];

  if (!rows.length) {
    lines.push('过去 24 小时没有访问记录。');
    return lines.join('\n');
  }

  rows.forEach((row, index) => {
    const referrer = row.referrer ? ` | 来源：${row.referrer}` : '';
    lines.push(`${index + 1}. ${row.visited_at} | ${row.ip} | ${row.path} | ${row.country || '-'}${referrer}`);
  });

  return lines.join('\n');
}

function reportHtml(rows, start, end) {
  const summary = `时间范围：${escapeHtml(start.toISOString())} 至 ${escapeHtml(end.toISOString())}<br>展示记录：${rows.length}${rows.length === REPORT_MAX_ROWS ? '（最多展示 200 条，实际可能更多）' : ''}`;
  const body = rows.length
    ? rows.map(row => `
      <tr>
        <td>${escapeHtml(row.visited_at)}</td>
        <td>${escapeHtml(row.ip)}</td>
        <td>${escapeHtml(row.path)}</td>
        <td>${escapeHtml(row.country || '-')}</td>
        <td>${escapeHtml(row.referrer || '-')}</td>
      </tr>`).join('')
    : '<tr><td colspan="5">过去 24 小时没有访问记录。</td></tr>';

  return `<!doctype html>
<html lang="zh-CN">
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #202124;">
    <h2>博客访问日报</h2>
    <p>${summary}</p>
    <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse; border-color: #dadce0; font-size: 13px;">
      <thead><tr><th>访问时间</th><th>IP</th><th>页面</th><th>国家/地区</th><th>来源</th></tr></thead>
      <tbody>${body}</tbody>
    </table>
  </body>
</html>`;
}

async function sendReport(end, env) {
  const apiKey = String(env.RESEND_API_KEY || '').trim();
  const recipient = String(env.REPORT_TO_EMAIL || '').trim();
  const sender = String(env.REPORT_FROM_EMAIL || '').trim();

  if (!apiKey || !recipient || !sender) {
    throw new Error('Daily report email is not configured');
  }

  const start = new Date(end.getTime() - DAY_MS);
  const result = await env.DB.prepare(`
    SELECT visited_at, ip, path, referrer, title, country
    FROM visit_logs
    WHERE visited_at >= ? AND visited_at < ?
    ORDER BY visited_at DESC
    LIMIT ?
  `).bind(start.toISOString(), end.toISOString(), REPORT_MAX_ROWS).all();
  const rows = result.results || [];
  const dayKey = end.toISOString().slice(0, 10);

  const emailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `caoyueyang-visitor-log-${dayKey}`
    },
    body: JSON.stringify({
      from: sender,
      to: [recipient],
      subject: `博客访问日报 ${dayKey}（${rows.length} 条）`,
      text: reportText(rows, start, end),
      html: reportHtml(rows, start, end)
    })
  });

  if (!emailResponse.ok) {
    const detail = (await emailResponse.text()).slice(0, 200);
    const error = new Error(`Daily report email failed (${emailResponse.status}): ${detail}`);
    error.resendStatus = emailResponse.status;
    throw error;
  }

  return {
    dayKey,
    count: rows.length
  };
}

async function sendDailyReport(controller, env) {
  await sendReport(new Date(controller.scheduledTime || Date.now()), env);
}

async function sendManualReport(request, env) {
  if (!authorized(request, env)) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'Cache-Control': 'no-store' }
    });
  }

  try {
    const result = await sendReport(new Date(), env);
    return jsonResponse({ ok: true, ...result }, 200);
  } catch (error) {
    console.error('Manual daily report failed', error);
    const resendStatus = Number(error?.resendStatus);
    const code = Number.isInteger(resendStatus)
      ? `resend_http_${resendStatus}`
      : 'worker_or_network_error';
    return jsonResponse({
      ok: false,
      error: '日报发送失败',
      code
    }, 500);
  }
}

async function cleanupLogs(env) {
  await env.DB.prepare(
    "DELETE FROM visit_logs WHERE visited_at < datetime('now', '-30 days')"
  ).run();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS' && url.pathname === '/visit') {
      const origin = originFor(request, env);
      return origin ? response('', 204, origin) : response('Forbidden', 403, '');
    }

    if (request.method === 'POST' && url.pathname === '/visit') {
      return recordVisit(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/admin/report') {
      return sendManualReport(request, env);
    }

    if (request.method === 'GET' && url.pathname === '/logs') {
      return listLogs(request, env);
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      return new Response('ok', { headers: { 'Cache-Control': 'no-store' } });
    }

    return new Response('Not found', { status: 404 });
  },

  async scheduled(controller, env) {
    await cleanupLogs(env);
    await sendDailyReport(controller, env);
  }
};
