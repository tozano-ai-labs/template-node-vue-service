#!/usr/bin/env node
import { argv, env, exit } from "node:process";

const ALLOWED_TYPES = [
  "feat",
  "fix",
  "docs",
  "refactor",
  "test",
  "chore",
  "perf",
  "style",
  "build",
  "ci",
  "security",
  "revert",
  "i18n",
  "logs",
];
const ALLOWED_SCOPES = ["api", "ui", "stream", "deps", "build", "docker", "ia", "rgpd", "docs"];

function isEmojiPrefix(value) {
  const re = /^[\p{Extended_Pictographic}]/u;
  return re.test(value);
}

function check(title, actor) {
  if (!title || typeof title !== "string") return { ok: false, reason: "missing title" };
  const trimmed = title.trim();

  if (!isEmojiPrefix(trimmed)) {
    return { ok: false, reason: "gitmoji prefix required" };
  }

  const match = trimmed.match(/^[\p{Extended_Pictographic}](?:\uFE0F|\uFE0E)?\s+(.+)$/u);
  if (!match) return { ok: false, reason: "invalid format" };
  const rest = match[1];

  const typeScopeRe = /^([a-z]+)\(([a-z][a-z0-9-]*)\):\s+(.+)$/;
  const typeScopeMatch = rest.match(typeScopeRe);
  if (!typeScopeMatch) return { ok: false, reason: "invalid type(scope): format" };
  const type = typeScopeMatch[1];
  const scope = typeScopeMatch[2];
  const description = typeScopeMatch[3];

  if (!ALLOWED_TYPES.includes(type)) return { ok: false, reason: `type not allowed: ${type}` };
  if (!ALLOWED_SCOPES.includes(scope) && scope.length > 20) {
    return { ok: false, reason: `scope invalid: ${scope}` };
  }

  if (description.endsWith(".")) return { ok: false, reason: "no trailing period" };
  if (description.length === 0) return { ok: false, reason: "empty description" };

  const firstWord = description.split(/\s+/)[0];
  if (/^(added|adds|fixed|fixes|updated|updates|changed|changes|removed|removes)$/.test(firstWord)) {
    return { ok: false, reason: "imperative required" };
  }

  const isDependabot = actor === "dependabot[bot]" || actor === "dependabot";
  if (!isDependabot && trimmed.length > 72) {
    return { ok: false, reason: `exceeds 72 chars (${trimmed.length})` };
  }

  return { ok: true };
}

const title = argv[2] || env.PR_TITLE || "";
const actor = argv[3] || env.GITHUB_ACTOR || "";
const result = check(title, actor);
if (!result.ok) {
  console.error(`INVALID: ${result.reason}`);
  exit(1);
}
console.log("VALID");
exit(0);
