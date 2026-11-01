import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";

describe("GET /api/health", () => {
  it("should return an ok status", async () => {
    const response = await request(createApp()).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});

describe("static client", () => {
  it("should serve the entry point and keep unknown API routes as 404", async () => {
    const staticDir = await mkdtemp(path.join(tmpdir(), "template-static-"));
    await writeFile(path.join(staticDir, "index.html"), "<h1>Template</h1>");
    const app = createApp({ staticDir });

    try {
      const page = await request(app).get("/");
      expect(page.status).toBe(200);
      expect(page.text).toContain("Template");

      const api = await request(app).get("/api/unknown");
      expect(api.status).toBe(404);
    } finally {
      await rm(staticDir, { recursive: true, force: true });
    }
  });

  it("should return 404 when the client build is missing", async () => {
    const app = createApp({ staticDir: "/tmp/template-client-absent" });

    const response = await request(app).get("/");

    expect(response.status).toBe(404);
  });

  it("should work without static files", async () => {
    const app = createApp({ staticDir: null });

    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
  });
});
