import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve("apps/mobile/dist");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};
createServer(async (req, res) => {
  try {
    const path = resolve(
      root,
      "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname),
    );
    if (path !== root && !path.startsWith(root + sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    let data;
    let type = types[extname(path)];
    try {
      data = await readFile(path);
    } catch {
      if (extname(path)) {
        res.writeHead(404);
        res.end();
        return;
      }
      data = await readFile(resolve(root, "index.html"));
      type = types[".html"];
    }
    res.writeHead(200, {
      "Content-Type": type ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    });
    res.end(data);
  } catch {
    res.writeHead(500);
    res.end("Unable to serve application");
  }
}).listen(4173, "0.0.0.0", () =>
  console.log("Baby English: http://localhost:4173"),
);
