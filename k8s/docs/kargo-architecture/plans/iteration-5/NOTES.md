# Iteration 5 Notes

## What improved
- The ranking improved again instead of merely shuffling names.
- The new top plan is materially simpler in the operational model than the
  iteration 4 winner.
- The current CI shape turned out to support the new idea better than expected
  because immutable git-derived image tags already exist.

## What got worse
- The winning plan now depends more heavily on OCI metadata discipline.
- Debugging release provenance moves from “read a Git file” to “inspect image
  metadata,” which is elegant but slightly more magical.

## What ideas converged
- Rendered outputs are still the right review surface.
- Stage-specific branches are still the right storage shape.
- Source of truth should still stay in `code-dot-org`.
- `warehouses/codeai/` is now clearly optional, not core.

## What new ideas appeared
- The strongest new idea is to treat the image as the release witness and carry
  the source commit via OCI provenance metadata.
- A possible future refinement is to attach a package snapshot digest the same
  way, which could make the top plan more immutable without bringing back a Git
  warehouse release record.
- Another possible refinement is to publish the Helm chart or Kustomize base to
  GHCR as well, so the warehouse still stays off Git while promotion-time source
  reconstruction gets thinner.

## What unresolved tensions remain
- Whether the team prefers explicitness (`Common-Case + Render`) or maximal KISS
  (`Image Provenance + Render`).
- Whether stronger immutability is worth another iteration of complexity.
- Whether OCI provenance should carry only source identity or also package
  snapshot identity.

## Should there be another iteration?
Yes.

Reasons:
- the winner changed again for a real reason
- there is still one obvious refinement path left
- the current top two are close enough that another boring iteration could still
  produce a better synthesis
