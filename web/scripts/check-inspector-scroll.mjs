// Regression check for finding 26cec351: residents and inspector share one scroll
// container, so opening a resident from a scrolled roster must start at the top
// with the whole name visible, while refreshes of the same inspector keep scroll.
// Runs the committed dist/ under a loopback /preview/ server; writes evidence JSON
// and two phone screenshots to the output directory.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const prepared = spawnSync("node", ["web/scripts/task.mjs", "path"], { cwd: root, encoding: "utf8" });
assert.equal(prepared.status, 0, prepared.stderr);
const project = prepared.stdout.trim().split("\n").at(-1);
const { chromium } = await import(pathToFileURL(path.join(project, "node_modules/playwright/index.mjs")));
const out = path.resolve(process.argv[2] ?? path.join(root, "artifacts/agency-interface"));
await fs.mkdir(out, { recursive: true });
const port = 4291;
const preview = spawn("node", ["web/scripts/preview.mjs", String(port)], { cwd: root, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((resolve, reject) => {
  preview.stdout.once("data", resolve);
  preview.once("exit", (code) => reject(new Error(`Preview exited ${code}`)));
});
const browser = await chromium.launch();
const results = { date: new Date().toISOString(), finding: "26cec3512a838887c3c9e6b19de817b6d205371a4a340e6bf1556597ebc13fb1", viewports: [] };
let failed = false;
try {
  for (const [w, h] of [[844, 390], [320, 568], [667, 375], [390, 844], [1440, 900]]) {
    const context = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(`http://127.0.0.1:${port}/preview/?demo=1`);
    await page.getByRole("button", { name: "Pause demo" }).first().click({ timeout: 20000 });
    await page.getByRole("button", { name: "Find residents" }).first().click();
    const search = page.getByLabel("Search residents");
    const scroll = page.locator(".exp-panel-scroll");
    // Scroll the full roster to its end, then filter and open #154: the inspector
    // would otherwise inherit the roster's scrollTop.
    await scroll.evaluate((el) => (el.scrollTop = el.scrollHeight));
    const rosterScroll = await scroll.evaluate((el) => el.scrollTop);
    await search.fill("154");
    const row = page.locator(".exp-resident").first();
    const expected = (await row.locator("strong").textContent()).trim();
    await row.click();
    await page.waitForSelector(".exp-creature-head h2");
    await page.waitForTimeout(400);
    const opened = await page.evaluate(() => {
      const s = document.querySelector(".exp-panel-scroll");
      const h2 = document.querySelector(".exp-creature-head h2");
      const sr = s.getBoundingClientRect(), hr = h2.getBoundingClientRect();
      return { scrollTop: s.scrollTop, panelTop: sr.top, panelBottom: sr.bottom, nameTop: hr.top, nameBottom: hr.bottom, name: h2.textContent, nameFocused: document.activeElement === h2 };
    });
    if ([844, 320].includes(w))
      await page.screenshot({ path: path.join(out, `inspector-open-${w}x${h}.jpg`), type: "jpeg", quality: 70 });
    // Same inspector refreshed by live demo frames keeps the reader's place.
    await scroll.evaluate((el) => (el.scrollTop = 120));
    await page.getByRole("button", { name: "Resume demo" }).first().click();
    await page.waitForTimeout(1500);
    const refreshedScroll = await scroll.evaluate((el) => el.scrollTop);
    const nameVisible = opened.nameTop >= opened.panelTop - 0.5 && opened.nameBottom <= opened.panelBottom + 0.5;
    const passed = opened.scrollTop === 0 && nameVisible && opened.name.includes(expected) && opened.nameFocused && refreshedScroll === 120 && !errors.length;
    if (!passed) failed = true;
    results.viewports.push({ viewport: `${w}x${h}`, rosterScroll, expected, ...opened, nameVisible, refreshedScroll, errors, passed });
    console.log(passed ? "PASS" : "FAIL", `${w}x${h}`, `scrollTop=${opened.scrollTop}`, `name=${opened.name}`, `visible=${nameVisible}`, `refreshKept=${refreshedScroll}`);
    await context.close();
  }
} finally {
  await browser.close();
  preview.kill();
}
results.passed = !failed;
await fs.writeFile(path.join(out, "inspector-scroll.json"), JSON.stringify(results, null, 2) + "\n");
process.exit(failed ? 1 : 0);
