#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const catalogPath = path.join(root, 'catalog', 'index.json');
const repoUrl = 'https://github.com/xuziyue/internal-skills-marketplace.git';

function usage() {
  console.log(`Usage:
  skillhub list
  skillhub install <slug> [--ref <version>] [--path <submodule-path>]
  skillhub check-updates --lock <project-skill-lock.json>`);
}

async function readCatalog() {
  const raw = await fs.readFile(catalogPath, 'utf8');
  return JSON.parse(raw);
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = {};
  const positionals = [];

  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const value = rest[i + 1];
      options[key] = value;
      i += 1;
    } else {
      positionals.push(token);
    }
  }

  return { command, options, positionals };
}

function compareSemver(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
}

async function main() {
  const { command, positionals, options } = parseArgs(process.argv.slice(2));
  if (!command) {
    usage();
    process.exitCode = 1;
    return;
  }

  const catalog = await readCatalog();

  if (command === 'list') {
    for (const skill of catalog.skills) {
      console.log(`${skill.slug}\t${skill.version}\t${skill.stability}`);
    }
    return;
  }

  if (command === 'install') {
    const slug = positionals[0];
    if (!slug) {
      usage();
      process.exitCode = 1;
      return;
    }

    const skill = catalog.skills.find((x) => x.slug === slug);
    if (!skill) {
      console.error(`Unknown skill: ${slug}`);
      process.exitCode = 1;
      return;
    }

    const ref = options.ref || skill.recommendedVersion;
    const targetPath = options.path || 'vendor/skills-marketplace';

    console.log('# Run in your consumer project root');
    console.log(`git submodule add ${repoUrl} ${targetPath}`);
    console.log(`git -C ${targetPath} checkout ${ref}`);
    console.log('# Then enable this skill in your project lock file:');
    console.log(`{ "slug": "${skill.slug}", "version": "${ref}", "source": "${targetPath}/${skill.path}" }`);
    return;
  }

  if (command === 'check-updates') {
    const lockPath = options.lock;
    if (!lockPath) {
      usage();
      process.exitCode = 1;
      return;
    }

    const lockRaw = await fs.readFile(path.resolve(root, lockPath), 'utf8');
    const lock = JSON.parse(lockRaw);

    for (const item of lock.skills || []) {
      const skill = catalog.skills.find((x) => x.slug === item.slug);
      if (!skill) {
        console.log(`${item.slug}: missing from catalog`);
        continue;
      }

      const current = item.version;
      const rec = skill.recommendedVersion;
      const min = skill.minSafeVersion;

      const isBehind = compareSemver(current, rec) < 0;
      const isUnsafe = compareSemver(current, min) < 0;

      if (isUnsafe) {
        console.log(`${item.slug}: ${current} < minSafe ${min} [WARNING]`);
      } else if (isBehind) {
        console.log(`${item.slug}: ${current} < recommended ${rec} [UPDATE AVAILABLE]`);
      } else {
        console.log(`${item.slug}: ${current} [UP TO DATE]`);
      }
    }
    return;
  }

  usage();
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
