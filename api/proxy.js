const UPSTREAM = "https://sullyos-amsg.2462948308.workers.dev";

export default async function handler(req, res) {
  // 全局跨域头配置
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,PUT,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "*");

  // 处理OPTIONS预检请求
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const baseUrl = `http://${req.headers.host}`;
    const { pathname, search } = new URL(req.url, baseUrl);
    const targetUrl = new URL(pathname + search, UPSTREAM);

    // 处理POST请求体读取（Vercel专用兼容写法）
    let body = undefined;
    if (!["GET", "HEAD"].includes(req.method)) {
      const buffers = [];
      for await (const chunk of req) buffers.push(chunk);
      body = Buffer.concat(buffers);
    }

    // 转发请求
    const upstreamRes = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(UPSTREAM).host
      },
      body
    });

    // 透传响应
    const resText = await upstreamRes.text();
    res.statusCode = upstreamRes.status;
    upstreamRes.headers.forEach((v, k) => res.setHeader(k, v));
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.send(resText);
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: "上游Worker连接失败", detail: err.message });
  }
}
