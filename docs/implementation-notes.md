# Implementation Notes

## Runtime

- Use Node.js 22 through nvm.

## Local commands

```bash
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm use 22
npm run validate:skills
npm run build:catalog
npm run cli -- list
```

## Current MVP status

- Skill schema and folder contract are defined.
- Validation and catalog generation scripts are working.
- UI can render generated catalog.
- CLI supports list/install/check-updates.
- CI workflow validates skills and builds catalog.
