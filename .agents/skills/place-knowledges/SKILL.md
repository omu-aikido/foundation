---
name: place-knowledges
description: Use this skill when deciding where knowledge from a code change, correction, or review belongs—code, tests, comments, documentation, schemas, configuration, examples, decision records, or commit messages. Produce a minimal placement plan before editing when information could be duplicated or lost. Do not use it to draft prose, choose a commit message, or perform edits or Git operations.
---

# Place Knowledge

Decide where each useful piece of knowledge should live so that the current
system remains understandable after the change context is forgotten.

Treat knowledge placement as ownership, not documentation coverage. Each useful
fact should have one authoritative home. Do not repeat the same knowledge across
artifacts merely to make the change feel explained.

## Core ownership rules

Use these as exclusive defaults:

- **Code owns How.** Implementation expresses how the system works and enforces
  invariants. Do not restate implementation mechanics in comments or tests when
  they are already evident from the code.
- **Tests own What.** Tests preserve observable behavior, boundaries, failures,
  recovery, and regression contracts. Prefer behavioral requirements over
  explanations of implementation structure.
- **Commit history owns Why.** Commit messages preserve why this change was made,
  including non-obvious rationale and immediate compatibility consequences.
  They may contain enough what to identify the change, but should not become the
  sole home for stable current behavior or contracts.
- **Implementation comments own Why not.** An implementation comment should exist
  only when a future maintainer
  could otherwise make an apparently reasonable but incorrect local change.
  Preserve the stable reason that a tempting simplification, refactor, API,
  algorithm, ordering, conversion, or alternative must not be used. Do not use
  comments to narrate what the code does, restate how it works, or preserve
  merely historical rejected alternatives.

If a knowledge item does not fit one of these homes, place it in the artifact
whose reader or contract actually owns it. Documentation, schemas,
configuration, migrations, examples, and decision records are first-class
authorities when they define public usage, data shape, compatibility, or
history.

## Contract

- **Input:** the authoritative current behavior or requirement, the relevant
  change or diff, and the artifacts that may need to preserve it.
- **Output:** a concise placement plan identifying each knowledge item, its
  authoritative home, any justified projections, and the action required.
- **Side effects:** none. This skill decides placement; the workflow that owns
  each artifact performs any resulting edit or repository operation.
- **Failure:** if the current state, authority, or intended audience is
  ambiguous, inspect the relevant artifacts and ask or stop rather than
  guessing or duplicating information everywhere.

## Scope

This skill answers **where should this information live?** It does not draft or
edit the chosen artifact, summarize a commit, or execute a repository operation.

## Workflow

1. Establish the current state from the source of truth and the relevant diff.
   Separate stable behavior, user-facing usage, local constraints, regression
   contracts, implementation detail, and historical rationale. For a
   correction, render from the resulting state rather than preserving rejected
   alternatives unless the artifact is explicitly history-sensitive or the
   rejected alternative remains a plausible future mistake that must be
   prevented.
2. Find existing homes before creating or editing artifacts. Prefer one
   authoritative home for each fact; note a current artifact that should be
   updated or removed instead of creating a competing explanation.
3. Classify each knowledge item:
   - **Code:** how the system implements behavior and enforces invariants.
   - **Tests:** what observable behavior, boundaries, failures, recovery, and
     regression contracts the system must preserve.
   - **Implementation comments:** why an otherwise reasonable local change or
     simplification must not be made. The constraint must be stable,
     non-obvious, and not inferable from the surrounding code.
   - **Documentation or examples:** current usage, public contracts, and
     user-facing or architectural guidance. API documentation comments and
     docstrings belong here and may describe behavior, inputs, outputs, and errors.
   - **Schema, configuration, or migration:** the authoritative data or
     compatibility contract for that concern.
   - **Commit message:** why this commit exists, plus only enough what to
     identify the change and its immediate compatibility consequences. It is
     history, not the sole home for stable behavior.
   - **Decision record, changelog, or migration guide:** rationale and
     before/after context that future readers explicitly need as history.
4. Add a projection only when it enforces a distinct contract or serves a
   reader who cannot rely on the authoritative home. A projection is not
   justified merely because repeating the information would make an artifact
   easier to read. Derive it from the authoritative home, keep wording
   consistent, and omit it when the information is already obvious from the
   source, test, schema, or diff.
5. Before adding an implementation comment, apply this check:

   > If this comment were deleted, could a future maintainer reasonably make a
   > locally sensible change that would violate a hidden constraint?

   If no, omit the comment. If yes, write only the constraint and why the
   tempting alternative is wrong; do not narrate the existing implementation.
6. Produce the placement plan in this shape:

   | Knowledge | Authority | Projection or action | Reason |
   | --- | --- | --- | --- |
   | [fact or rationale] | [one artifact] | [none or distinct artifact] | [reader or contract served] |

7. Validate the plan before handing it off:
   - every necessary stable fact has exactly one authoritative home;
   - code carries implementation knowledge instead of explanatory comments;
   - tests state behavioral contracts rather than mirror implementation detail;
   - implementation comments contain only stable **why not** constraints, not
     code narration or historical residue;
   - no explanation exists only in a commit message when it must survive as
     current usage, behavior, or a contract;
   - duplicated knowledge exists only where another artifact enforces a
     distinct contract or serves a reader that cannot rely on the authority;
   - current-state artifacts contain no accidental correction residue;
   - commit-message input contains only commit-specific what/why;
   - unresolved ownership or audience decisions are surfaced instead of
     silently assigned.

Return the placement plan and any unresolved decision. Do not write prose or
modify files as part of this skill.
