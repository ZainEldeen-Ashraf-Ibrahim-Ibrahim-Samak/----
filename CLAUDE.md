<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
`specs/001-educenter-finance/plan.md`

Supporting design docs for this feature:
- Spec: `specs/001-educenter-finance/spec.md`
- Research (decisions): `specs/001-educenter-finance/research.md`
- Data model: `specs/001-educenter-finance/data-model.md`
- Contracts: `specs/001-educenter-finance/contracts/` (IPC + sync)
- Quickstart: `specs/001-educenter-finance/quickstart.md`
- Constitution: `.specify/memory/constitution.md`

Stack: Electron + TypeScript (strict), React + Tailwind renderer, SQLite (better-sqlite3)
local source of truth, MongoDB background sync, Zod validation at every boundary,
react-i18next (ar/en + RTL/LTR), runtime white-label branding.
<!-- SPECKIT END -->
