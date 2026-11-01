import { describe, expect, it, vi } from "vitest";
import { fetchHealth } from "./api.js";

describe("fetchHealth", () => {
  it("should return the health payload when the API responds", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "ok" }),
    });

    await expect(fetchHealth(fetchImpl)).resolves.toEqual({ status: "ok" });
    expect(fetchImpl).toHaveBeenCalledWith("/api/health");
  });

  it("should throw when the API responds with an error", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 503 });

    await expect(fetchHealth(fetchImpl)).rejects.toThrow("HTTP 503");
  });
});
