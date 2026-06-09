<!--
SYNC IMPACT REPORT
==================
Version change: (template, unversioned) → 1.0.0
Bump rationale: Initial ratification of the project constitution. All placeholder
tokens replaced with concrete project principles. MAJOR baseline established.

Modified principles: N/A (initial adoption)
Added principles:
  - I. Type-Safe Codebase (NON-NEGOTIABLE)
  - II. Offline-First, Sync-Reliable Data
  - III. Cross-Platform Parity (macOS & Windows)
  - IV. Internationalization & Bidirectional UI (ar/en)
  - V. Adaptive & Themeable Interface
  - VI. Runtime White-Label Branding
Added sections:
  - Technology & Platform Constraints
  - Development Workflow & Quality Gates
  - Governance

Removed sections: None

Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (Constitution Check gate is generic; aligns)
  - ✅ .specify/templates/spec-template.md (no constitution-specific edits required)
  - ✅ .specify/templates/tasks-template.md (no constitution-specific edits required)
  - ⚠ README.md / docs/quickstart.md (not present yet; create when scaffolding repo)

Follow-up TODOs:
  - RATIFICATION_DATE set to 2026-06-09 (first adoption date). Confirm if an earlier
    project-start date should be used instead.
-->

# Sysm Constitution

<!-- "Sysm" is the internal codename. The product name, logo, and icon are
     white-label and configurable at runtime (see Principle VI). -->

## Core Principles

### I. Type-Safe Codebase (NON-NEGOTIABLE)

The entire codebase MUST be written in TypeScript with `strict` mode enabled.
`any` is prohibited except at well-documented external boundaries, where it MUST
be narrowed immediately via validation or type guards. Build and CI MUST fail on
type errors. Data crossing process boundaries (Electron main ↔ renderer, IPC,
network sync) and storage boundaries (SQLite, MongoDB) MUST be validated against
an explicit schema at runtime — compile-time types alone are insufficient for
untrusted input.

**Rationale**: Type safety is the cheapest defect-prevention mechanism available
and is the foundation that makes a multi-process, multi-store desktop app
maintainable.

### II. Offline-First, Sync-Reliable Data

The application MUST be fully usable offline. SQLite is the local source of truth
for the running session; all reads and writes MUST succeed without network access.
MongoDB is the online synchronization target only. Synchronization MUST be
deterministic and resumable: every synced record carries identity and version/
timestamp metadata, conflicts MUST be resolved by an explicit, documented strategy
(never silent data loss), and an interrupted sync MUST be safe to retry.

**Rationale**: A desktop tool that breaks when the network does is not trustworthy;
separating the local truth (SQLite) from the sync target (MongoDB) keeps the UX
responsive and the data durable.

### III. Cross-Platform Parity (macOS & Windows)

Every feature MUST work identically on macOS and Windows. Platform-specific code
MUST be isolated behind a small, explicit abstraction (e.g., paths, file dialogs,
auto-update, OS integration) and MUST never leak into feature logic. No feature may
ship if it has only been verified on one platform; release builds MUST be produced
and smoke-tested for both targets.

**Rationale**: Electron's value is one codebase across desktops — that promise only
holds if parity is enforced rather than assumed.

### IV. Internationalization & Bidirectional UI (ar/en)

All user-facing text MUST come from i18n resource files — no hard-coded strings in
components. Arabic (ar) and English (en) MUST both be fully supported at all times.
The UI MUST switch layout direction (RTL for Arabic, LTR for English) correctly,
and every screen MUST be verified in both directions. Locale formatting (dates,
numbers, plurals) MUST use the active locale.

**Rationale**: Arabic-first means RTL is a primary requirement, not an
afterthought; treating i18n as structural prevents costly retrofits.

### V. Adaptive & Themeable Interface

The UI MUST be built with Tailwind CSS and MUST be responsive/adaptive across the
full range of supported window and screen sizes — from small laptop windows to
large external displays — with no fixed-pixel layouts that break on resize. Both
dark and light themes MUST be supported, switchable at runtime, and MUST follow the
OS preference by default. All components MUST be authored to work in both themes
and both layout directions.

**Rationale**: A desktop window can be any size and any theme; designing
adaptively and theme-agnostically from the start avoids per-screen breakage.

### VI. Runtime White-Label Branding

The product name, logo, and application icon MUST be configurable from within the
running application without code changes or a rebuild. Branding values MUST be read
from configuration/state at runtime, persisted, and applied consistently across the
window title, in-app chrome, and (where the platform permits) the app icon.
Defaults MUST be provided, and the app MUST remain functional if a custom asset is
missing or invalid.

**Rationale**: The application is explicitly designed to be re-branded by
deployers; baking the brand into source would defeat its core purpose.

## Technology & Platform Constraints

- **Runtime**: Electron (main + renderer processes).
- **Language**: TypeScript, `strict` mode, across main, preload, and renderer.
- **Local storage**: SQLite (local source of truth, offline-capable).
- **Online sync**: MongoDB (synchronization target only, never required for the
  app to run).
- **Styling**: Tailwind CSS; responsive/adaptive layouts; dark + light themes.
- **Internationalization**: i18n framework with `ar` and `en` locales and RTL/LTR
  support.
- **Target platforms**: macOS and Windows, with build and packaging for both.
- **Branding**: runtime-configurable product name, logo, and app icon.

Introducing an additional core technology (new database, alternate UI framework,
additional runtime) is an amendment-level decision and MUST be justified against
the principles above before adoption.

## Development Workflow & Quality Gates

- **Constitution Check**: Each implementation plan MUST include a Constitution
  Check confirming the feature honors all applicable principles (type safety,
  offline-first, cross-platform parity, i18n/RTL, adaptive+theme, branding-safe).
- **Definition of Done**: A feature is not "done" until it (a) passes type checks
  and lint with zero errors, (b) works offline against SQLite, (c) is verified on
  both macOS and Windows, (d) is verified in both `ar` (RTL) and `en` (LTR), and
  (e) is verified in both dark and light themes across small and large window sizes.
- **Reviews**: Code review MUST verify compliance with the principles. Any
  deviation MUST be recorded in the plan's Complexity Tracking with justification.
- **Data changes**: Any change to synced data shape MUST address SQLite↔MongoDB
  schema/version compatibility and migration.

## Governance

This constitution supersedes other development practices for the project. When a
practice conflicts with a principle here, this document wins.

- **Amendments**: Changes to principles or constraints MUST be proposed as a
  documented change, reviewed, and recorded in this file with an updated version
  and Sync Impact Report. Where an amendment changes existing behavior, a migration
  note MUST be included.
- **Versioning policy** (semantic):
  - **MAJOR**: backward-incompatible governance/principle removals or redefinitions.
  - **MINOR**: a new principle/section, or materially expanded guidance.
  - **PATCH**: clarifications, wording, and non-semantic refinements.
- **Compliance review**: Plans, reviews, and releases MUST verify compliance with
  the principles. Complexity or deviation MUST be justified, not hidden.

**Version**: 1.0.0 | **Ratified**: 2026-06-09 | **Last Amended**: 2026-06-09
