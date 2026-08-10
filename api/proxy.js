const UPSTREAM = "https://sullyos-amsg.2462948308.workers.dev";

export default async function handler(req, res) {
  // 跨域固定配置
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,PUT,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  try {
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const targetUrl = new URL(urlObj.pathname + urlObj.search, UPSTREAM);

    let fetchOpts = {
      method: req.method,
      headers: { ...req.headers, host: new URL(UPSTREAM).host }
    };

    // 安全处理请求体，规避Vercel流式读取报错
    if (!["GET", "HEAD"].includes(req.method)) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      if (chunks.length) fetchOpts.body = Buffer.concat(chunks);
    }

    const resp = await fetch(targetUrl, fetchOpts);
    res.statusCode = resp.status;
    res.setHeader("Access-Control-Allow-Origin", "*");
    const text = await resp.text();
    return res.send(text);
  } catch (e) {
    console.error(e);
    res.status(502).json({ msg: "上游连接失败", err: String(e) });
  }
}
