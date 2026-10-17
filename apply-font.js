// apply-font.js
// Run ONCE from the project root:   node apply-font.js
// It switches every file in src/ from react-native's Text / TextInput to src/components/AppText.js.
// Safe to run twice (files that are already switched are skipped).
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "src");
const TARGET = path.join(SRC, "components", "AppText.js");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : p.endsWith(".js") ? [p] : [];
  });
}

if (!fs.existsSync(TARGET)) {
  console.log("src/components/AppText.js not found. Put AppText.js there first.");
  process.exit(1);
}

const RN_IMPORT = /import\s*\{([^}]*)\}\s*from\s*["']react-native["'];?/;
let changed = 0;

for (const file of walk(SRC)) {
  if (file === TARGET) continue;
  let code = fs.readFileSync(file, "utf8");
  if (code.includes("AppText")) continue;

  const m = RN_IMPORT.exec(code);
  if (!m) continue;

  const names = m[1].split(",").map((n) => n.trim()).filter(Boolean);
  const moved = names.filter((n) => n === "Text" || n === "TextInput");
  if (!moved.length) continue;

  const kept = names.filter((n) => !moved.includes(n));
  let rel = path.relative(path.dirname(file), TARGET).replace(/\\/g, "/").replace(/\.js$/, "");
  if (!rel.startsWith(".")) rel = "./" + rel;

  const rnLine = kept.length ? `import { ${kept.join(", ")} } from "react-native";` : "";
  const appLine = `import { ${moved.join(", ")} } from "${rel}";`;
  code = code.replace(m[0], [rnLine, appLine].filter(Boolean).join("\n"));

  fs.writeFileSync(file, code);
  changed++;
  console.log("updated", path.relative(__dirname, file));
}
console.log(changed + " file(s) updated");