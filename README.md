# Internal Skills Marketplace MVP

A lightweight Skills Hub for GitHub Copilot skills in a single repository, where each skill lives in a folder under `skills/`.

## MVP goals

- Discover skills in a simple UI.
- Validate skill metadata in CI.
- Build a searchable catalog index.
- Generate integration commands for consumer projects.
- Start with lightweight governance (single approval, warning policies).

## Repository layout

- `skills/`: skill folders (`manifest.json`, `README.md`, `CHANGELOG.md`).
- `catalog/index.json`: generated catalog used by UI and CLI.
- `scripts/`: validation and catalog build scripts.
- `ui/`: minimal catalog web page.
- `cli/`: helper CLI for install and update checks.
- `specs/`: schemas and API draft.
- `config/policies.json`: warning-level policy rules.

## Quick start

0. Use Node.js 22:

```bash
nvm use 22
```

1. Build catalog index:

```bash
npm run build:catalog
```

2. Validate all skills:

```bash
npm run validate:skills
```

3. Open UI:

Open `ui/index.html` with a static server and verify skills render from `catalog/index.json`.

4. Use CLI:

```bash
npm run cli -- list
npm run cli -- install code-review-basic --ref 1.0.0
npm run cli -- check-updates --lock cli/project-skill-lock.example.json
```

## Skill folder contract

Each folder under `skills/` must include:

- `manifest.json`
- `README.md`
- `CHANGELOG.md`
- `SKILL.md`

See `specs/schemas/skill-manifest.schema.json` for expected fields.
