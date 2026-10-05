---
name: update-fontawesome-kit
description: Publish a new Font Awesome kit download (new custom icons) to the cdo-dsco S3 bucket and bump the timestamped URLs, kitIcons list and storybook. Use when designers add icons to the Code.org FontAwesome kit and engineers need them in code.
---

# Update the Font Awesome kit

Procedure of record: `frontend/packages/fonts/README.md` ("Updating FontAwesome Files"). This skill
automates everything after the browser download. Read that README if a step here is unclear.

## Human steps (cannot be automated)

1. Sign in to fontawesome.com with the shared dev account, open "Code.org FontAwesome Kit v6
   (Current)", Self-Host on the Web, "Download Web Files". Save the zip anywhere.
2. Needs AWS credentials with `s3:PutObject` and `s3:ListBucket` on `cdo-dsco/assets/font-awesome-pro/*`
   (`aws sts get-caller-identity` must work; `aws` CLI installed).

## Status

The S3 upload and the post-upload checks (CORS, `curl` of the new URL) have never been run: the author had
no bucket access when this was written. Everything else works with `--skip-upload`. After the first real run,
delete this section and fix whatever broke.

## Agent steps

1. Dry run, no uploads or edits beyond the working tree:
   `node .agents/skills/update-fontawesome-kit/update.mjs <kit.zip> --dry-run`
   It prints the new timestamp, added/removed kit icons, and the files it would change.
2. Review the diff of icon names. If icons are removed, `grep -r "fa-<name>" apps frontend dashboard/app shared`
   for usages before going on.
3. Real run: same command without `--dry-run` (add `--skip-upload` while S3 access is missing; the script
   then leaves the unzipped, path-rewritten files in a temp dir and prints where). It rewrites `../webfonts` to the timestamped absolute URL,
   uploads `css/` and `webfonts/` with `aws s3 sync`, replaces the old timestamp in
   `frontend/packages/component-library-styles/font.scss`, `frontend/packages/fonts/src/loader/index.ts`,
   `shared/css/font.scss`, and rewrites the `kitIcons` set (sorted) in
   `frontend/packages/component-library/src/fontAwesomeV6Icon/constants/index.ts`.
4. Verify: `curl -sI https://dsco.code.org/assets/font-awesome-pro/<ts>/css/custom-icons.min.css`
   returns 200 with `access-control-allow-origin`; run the FontAwesomeV6Icon storybook and confirm the
   new icons render (story "Group of custom icons" reads `kitIcons`, so nothing to edit there); `yarn typecheck` in `apps/`; `./tools/hooks/pre-commit`.
5. Open a PR. Mention the timestamp and the added/removed icons.

Old timestamp folders stay in S3; other code (e.g. `apps/src/applab/Exporter.js`) still pins them.
Never delete them.
