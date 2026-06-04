# skillhub CLI (MVP)

## Commands

- `list`: print available skills from `catalog/index.json`
- `install <slug> [--ref <version>] [--path <submodule-path>]`: print integration commands
- `check-updates --lock <lock-file>`: compare project pins with recommended and min-safe versions

## Example

```bash
npm run cli -- list
npm run cli -- install code-review-basic --ref 1.0.0
npm run cli -- check-updates --lock cli/project-skill-lock.example.json
```
