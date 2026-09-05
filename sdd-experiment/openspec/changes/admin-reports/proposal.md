# admin-reports

## Why

The reporting pages (level_completions, level_answers, debug) are
read-only, replica-backed, and low-urgency — they port last among the
user-support tools. Porting them completes the admin_reports controller
so the whole user-support surface is SPA-served except documented
exceptions.

## What Changes

- New /api/admin read-only endpoints for level completion stats and
  level answers (replica-backed as legacy), and a debug/info endpoint.
- New SPA report pages replacing admin_reports#level_completions,
  #level_answers, #debug (the #directory page was already replaced by
  the shell's landing page).
- CSV variants (level_completions.csv, pd_progress.csv) stay Rails GETs
  linked from the SPA pages.
- Legacy HAML pages remain until admin-haml-decommission.

## Capabilities

### New Capabilities

- `admin-reporting`: read-only admin reports via API + SPA pages, CSVs
  remaining as Rails exports.

### Modified Capabilities

<!-- none -->

## Impact

- dashboard: Api::Admin reports controller; query extraction from
  admin_reports_controller with replica usage preserved.
- frontend/packages/admin: report pages (tables + filters).
- Depends on: admin-api-foundation, admin-frontend-shell.
