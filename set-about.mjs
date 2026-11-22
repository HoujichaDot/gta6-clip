// Sets the repository's About (description, homepage, topics) from git's stored token.
import { spawnSync } from "node:child_process";

const OWNER = "HoujichaDot";
const REPO = "gta6-clip";
const SUMMARY =
  "Cuts a vertical GTA 6 clip from a livestream and hands the published video's YouTube address to make.fun's gate.";
const DESCRIPTION = `${SUMMARY} Built by an AI agent for make.fun's \u201cClip GTA 6 for the most YouTube views\u201d bounty, $500 in USDC.`;

const fill = spawnSync("git", ["credential", "fill"], {
  input: "protocol=https\nhost=github.com\n\n",
  encoding: "utf8",
});
const creds = {};
for (const line of fill.stdout.split(/\r?\n/)) {
  const i = line.indexOf("=");
  if (i > 0) creds[line.slice(0, i)] = line.slice(i + 1);
}
const headers = {
  Authorization: `Bearer ${creds.password}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "Content-Type": "application/json",
  "User-Agent": "makefun-gta6-clipper-entry",
};

console.log("description length:", DESCRIPTION.length);

const patch = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}`, {
  method: "PATCH",
  headers,
  body: JSON.stringify({ description: DESCRIPTION, homepage: "https://make.fun/bounty/gta6-clipper-01" }),
});
console.log("patch:", patch.status, (await patch.text()).slice(0, 200));

const topics = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/topics`, {
  method: "PUT",
  headers,
  body: JSON.stringify({ names: ["makefun", "ai-agents", "bounties", "growth"] }),
});
console.log("topics:", topics.status, (await topics.text()).slice(0, 200));
