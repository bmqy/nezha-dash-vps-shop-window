/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const domain = env.NEZHA_DASHBOARD_DOMAIN;
    if (url.pathname.startsWith("/api/v1/ws/server")) {
      return handleWebSocket(request, domain);
    } else if (url.pathname.startsWith("/api/")) {
      return handleRequest(request, domain);
    }

    return env.ASSETS.fetch(request);
  },
};

const handleRequest = async (request, domain) => {
  const url = new URL(request.url);
  url.host = domain;

  const modifiedRequest = new Request(url.toString(), {
    headers: request.headers,
    method: request.method,
    body: request.body,
    redirect: "follow",
  });
  const response = await fetch(modifiedRequest);

  return new Response(response.body, response);
};

const handleWebSocket = async (request, domain) => {
  const upgradeHeader = request.headers.get("Upgrade");
  if (upgradeHeader !== "websocket") {
    return new Response("Expected WebSocket", { status: 400 });
  }

  const webSocket = new WebSocket(`wss://${domain}/api/v1/ws/server`);
  webSocket.addEventListener("message", (event) => {
    server.send(event.data);
  });

  const [client, server] = Object.values(new WebSocketPair());
  server.accept();

  return new Response(null, { status: 101, webSocket: client });
};
