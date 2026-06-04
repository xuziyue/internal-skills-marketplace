import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const skillsDir = path.join(root, 'skills');
const outFile = path.join(root, 'catalog', 'index.json');

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function main() {
  const entries = await fs.readdir(skillsDir, { withFileTypes: true });
  const skills = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const skillPath = path.join(skillsDir, entry.name);
    const manifestPath = path.join(skillPath, 'manifest.json');

    try {
      const manifest = await readJson(manifestPath);
      skills.push({
        ...manifest,
        path: `skills/${entry.name}`
      });
    } catch {
      // Skip invalid skills. Validation script enforces correctness in CI.
    }
  }

  skills.sort((a, b) => a.slug.localeCompare(b.slug));

  const payload = {
    generatedAt: new Date().toISOString(),
    total: skills.length,
    skills
  };

  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(`Catalog written: ${outFile}`);
  console.log(`Skills indexed: ${skills.length}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
