import assert from "node:assert";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const script = join(dirname(fileURLToPath(import.meta.url)), "check-pr-title.mjs");

function run(title, actor = "") {
  return spawnSync(process.execPath, [script, title, actor], { encoding: "utf8" });
}

test("accepts gitmoji titles with a type and scope", () => {
  const titles = [
    "✨ feat(api): add health endpoint",
    "🐛 fix(ui): drop crash on empty state",
    "📦 build(docker): pin the base image",
    "🔧 chore(deps): bump express",
  ];

  for (const title of titles) {
    assert.equal(run(title).status, 0, title);
  }
});

test("rejects malformed titles", () => {
  const titles = [
    "feat(api): add health endpoint",
    "✨ feat add health endpoint",
    "✨ unknown(api): add health endpoint",
    "✨ feat(api): add health endpoint.",
    "✨ feat(api): added health endpoint",
  ];

  for (const title of titles) {
    assert.equal(run(title).status, 1, title);
  }
});

test("allows Dependabot titles longer than 72 characters", () => {
  const title = `📦 build(deps): bump ${"a".repeat(80)}`;

  assert.equal(run(title, "dependabot[bot]").status, 0);
});
