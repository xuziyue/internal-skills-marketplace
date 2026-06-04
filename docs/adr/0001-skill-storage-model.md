# ADR 0001: Skill Storage Model

## Status
Accepted

## Context
We need a quick MVP with low operational overhead and a simple developer experience.

## Decision
Store all skills in one repository, one skill per folder under `skills/`.

## Consequences

- Pros:
  - Fast setup and central visibility.
  - Easier policy and schema enforcement.
  - Simple UI/CLI integration against one catalog index.
- Cons:
  - Repository growth over time.
  - Independent permission boundaries per skill are weaker than one-repo-per-skill.

## Future option
If governance or scaling requires stricter isolation, we can move to one-skill-one-repository with a registry adapter.
