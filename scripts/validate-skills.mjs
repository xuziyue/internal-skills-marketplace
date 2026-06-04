import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const skillsDir = path.join(root, 'skills');

const requiredFiles = ['manifest.json', 'README.md', 'CHANGELOG.md', 'SKILL.md'];
const requiredFields = [
  'name',
  'slug',
  'version',
  'summary',
  'owners',
  'stability',
  'tags',
  'recommendedVersion',
  'minSafeVersion'
];

const semverRe = /^\d+\.\d+\.\d+$/;
const slugRe = /^[a-z0-9-]+$/;

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

function validateManifest(manifest, folderName) {
  const errors = [];

  for (const field of requiredFields) {
    if (!(field in manifest)) {
      errors.push(`missing required field '${field}'`);
    }
  }

  if (manifest.slug && !slugRe.test(manifest.slug)) {
    errors.push(`invalid slug '${manifest.slug}'`);
  }

  if (manifest.slug && manifest.slug !== folderName) {
    errors.push(`slug '${manifest.slug}' must match folder name '${folderName}'`);
  }

  for (const field of ['version', 'recommendedVersion', 'minSafeVersion']) {
    if (manifest[field] && !semverRe.test(manifest[field])) {
      errors.push(`field '${field}' must be semver x.y.z`);
    }
  }

  if (manifest.owners && !Array.isArray(manifest.owners)) {
    errors.push(`field 'owners' must be an array`);
  }

  if (manifest.tags && !Array.isArray(manifest.tags)) {
    errors.push(`field 'tags' must be an array`);
  }

  const allowedStability = new Set(['stable', 'beta', 'deprecated']);
  if (manifest.stability && !allowedStability.has(manifest.stability)) {
    errors.push(`field 'stability' must be one of stable|beta|deprecated`);
  }

  return errors;
}

async function main() {
  const entries = await fs.readdir(skillsDir, { withFileTypes: true });
  const skillDirs = entries.filter((x) => x.isDirectory());
  const allErrors = [];
  const skipped = [];

  for (const entry of skillDirs) {
    const folderName = entry.name;
    const skillPath = path.join(skillsDir, folderName);
    const manifestPath = path.join(skillPath, 'manifest.json');

    let hasManifest = true;
    try {
      await fs.access(manifestPath);
    } catch {
      hasManifest = false;
    }

    if (!hasManifest) {
      skipped.push(folderName);
      continue;
    }

    for (const file of requiredFiles) {
      const filePath = path.join(skillPath, file);
      try {
        await fs.access(filePath);
      } catch {
        allErrors.push(`${folderName}: missing file '${file}'`);
      }
    }

    try {
      const manifest = await readJson(manifestPath);
      const errors = validateManifest(manifest, folderName);
      allErrors.push(...errors.map((e) => `${folderName}: ${e}`));
    } catch {
      allErrors.push(`${folderName}: invalid JSON in manifest.json`);
    }
  }

  if (allErrors.length) {
    console.error('Skill validation failed:');
    for (const err of allErrors) {
      console.error(`- ${err}`);
    }
    process.exitCode = 1;
    return;
  }

  const validatedCount = skillDirs.length - skipped.length;
  console.log(`Skill validation passed (${validatedCount} skill folders).`);
  if (skipped.length) {
    console.log(`Skipped placeholder folders (no manifest.json): ${skipped.join(', ')}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
