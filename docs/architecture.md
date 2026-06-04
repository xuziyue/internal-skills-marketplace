# Architecture (MVP)

## Components

- Skill source: `skills/<slug>/` folders in this repository.
- Metadata validator: `scripts/validate-skills.mjs`.
- Catalog builder: `scripts/build-catalog-index.mjs`.
- Skills Hub UI: static page in `ui/index.html`.
- Integration CLI: `cli/skillhub.mjs`.
- Policy config: `config/policies.json`.

## Data flow

1. Maintainer updates a skill folder manifest.
2. CI runs validation script.
3. Catalog build script generates `catalog/index.json`.
4. UI and CLI read `catalog/index.json`.
5. Consumer projects use CLI-generated install/upgrade commands.

## Governance model

- Local role config for MVP.
- Single approval workflow modeled by process and CI checks.
- Warning-only policy for minimum recommended versions.
