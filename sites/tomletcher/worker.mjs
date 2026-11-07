// tomletcher.co.uk /openai/*: the static files are served by Workers Assets, but every request
// passes through here first (run_worker_first), so site-copying and scripting
// tools can be refused and the frame-refusal headers added. Browsers and
// link-preview fetchers (WhatsApp, LinkedIn, Slack) are not on the list.
const TOOLS = /curl|wget|httrack|webcopier|webzip|teleport|sitesucker|offline explorer|getright|grabnet|webreaper|wkhtmltopdf|headlesschrome|phantomjs|puppeteer|playwright|selenium|webdriver|scrapy|python-requests|python-urllib|aiohttp|httpx|go-http-client|java\/|libwww|okhttp|node-fetch|undici|axios|postman|insomnia|mechanize|nutch|zgrab|masscan|nikto|sqlmap|dirbuster|gobuster/i;

export default {
  async fetch(request, env) {
    const ua = request.headers.get('user-agent') || '';
    if (!ua || TOOLS.test(ua)) {
      return new Response('Forbidden\n', { status: 403, headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });
    }
    const res = await env.ASSETS.fetch(request);
    const headers = new Headers(res.headers);
    headers.set('x-frame-options', 'SAMEORIGIN');
    headers.set('content-security-policy', "frame-ancestors 'self'");
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  },
};
