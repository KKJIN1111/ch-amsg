export const config = {
  runtime: "edge"
};

const UPSTREAM = "https://sullyos-amsg.2462948308.workers.dev";

export default async function handler(req) {
  const origin = req.headers.get("origin") || "*";
  // 预检OPTIONS请求直接快速响应，减少超时
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS,PUT,DELETE",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Max-Age": "86400"
      }
    });
  }

  const res = await fetch(new URL(req.url, UPSTREAM), {
    method: req.method,
    headers: req.headers,
    body: req.body
  });

  const response = new Response(res.body, res);
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS,PUT,DELETE");
  response.headers.set("Access-Control-Allow-Headers", "*");
  return response;
}
