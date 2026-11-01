// @vitest-environment jsdom
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App.vue";

describe("App", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should render the service status once health resolves", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: "ok" }),
      }),
    );

    const wrapper = mount(App);
    await flushPromises();

    expect(wrapper.text()).toContain("État du service : ok");
  });

  it("should render an error when health fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    const wrapper = mount(App);
    await flushPromises();

    expect(wrapper.text()).toContain("Erreur : HTTP 503");
  });
});
