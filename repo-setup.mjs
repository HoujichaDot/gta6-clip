// Creates the public GitHub repository for the entry from the token in git's
// credential manager (never printed), then pushes the working tree with plain git.
import { spawnSync } from "node:child_process";

const OWNER = "HoujichaDot";
const REPO = "gta6-clip";
const API = "https://api.github.com";

const fill = spawnSync("git", ["credential", "fill"], {
  input: "protocol=https\nhost=github.com\n\n",
  encoding: "utf8",
});
if (fill.status !== 0) {
  console.error("git credential fill failed");
  process.exit(1);
}
const creds = {};
for (const line of fill.stdout.split(/\r?\n/)) {
  const i = line.indexOf("=");
  if (i > 0) creds[line.slice(0, i)] = line.slice(i + 1);
}
const token = creds.password;
if (!token) {
  console.error("no token in the stored credential");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "Content-Type": "application/json",
  "User-Agent": "makefun-gta6-clipper-entry",
};

const me = await fetch(`${API}/user`, { headers });
const meJson = await me.json();
console.log("authenticated as:", meJson.login);
if (meJson.login !== OWNER) {
  console.error(`the token belongs to ${meJson.login}, not ${OWNER}`);
  process.exit(1);
}

const existing = await fetch(`${API}/repos/${OWNER}/${REPO}`, { headers });
if (existing.status === 200) {
  console.log("repository already exists:", `${OWNER}/${REPO}`);
} else {
  const created = await fetch(`${API}/user/repos`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: REPO,
      description:
        "An AI agent cut a vertical GTA 6 clip from a GTA 6 livestream and hands in the video's YouTube address. Built for make.fun's Clip GTA 6 bounty, $500 in USDC.",
      homepage: "https://make.fun/bounty/gta6-clipper-01",
      private: false,
      has_issues: false,
      has_wiki: false,
      has_projects: false,
      auto_init: false,
      license_template: "mit",
    }),
  });
  if (!created.ok) {
    console.error("create failed:", created.status, (await created.text()).slice(0, 500));
    process.exit(1);
  }
  const c = await created.json();
  console.log("created:", c.full_name, "| license:", c.license?.spdx_id);
}
console.log("remote:", `https://github.com/${OWNER}/${REPO}.git`);
