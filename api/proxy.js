// 修改为你的Cloudflare Worker原始地址
const UPSTREAM = "https://sullyos-amsg.2462948308.workers.dev";

export default async function handler(req, res) {
  // 全局跨域处理，解决浏览器跨域报错
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,PUT,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "*");

  // 处理OPTIONS预检请求
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const { pathname, query } = new URL(req.url, `http://${req.headers.host}`);
  // 拼接目标上游完整地址
  const targetUrl = new URL(pathname, UPSTREAM);
  Object.entries(query).forEach(([k, v]) => targetUrl.searchParams.append(k, v));

  try {
    // 转发原始请求到CF Worker
    const upstreamRes = await fetch(targetUrl, {
      method: req.method,
      headers: { ...req.headers, host: new URL(UPSTREAM).host },
      body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined
    });

    const resBody = await upstreamRes.text();
    res.statusCode = upstreamRes.status;
    // 透传上游响应头并补充跨域头
    Object.entries(upstreamRes.headers).forEach(([k, v]) => res.setHeader(k, v));
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.send(resBody);
  } catch (err) {
    return res.status(502).json({ error: "上游Worker连接失败", detail: err.message });
  }
}
