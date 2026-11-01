import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DIST_DIR = path.resolve(__dirname, "../../client/dist");

export function createApp({ staticDir = DEFAULT_DIST_DIR } = {}) {
  const app = express();
  app.use(express.json());

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  if (staticDir) {
    app.use(express.static(staticDir));
    app.get("*", (request, response, next) => {
      if (request.path.startsWith("/api/")) {
        return next();
      }
      response.sendFile(path.join(staticDir, "index.html"), (error) => {
        if (error) {
          next();
        }
      });
    });
  }

  return app;
}
