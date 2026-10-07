---
name: update-fontawesome-kit
description: Guide an operator step by step through publishing a new Code.org Font Awesome kit (new custom icons) - download, S3 upload, timestamped URL bumps, kitIcons list, storybook - automating every step except the ones only a human can do. Use when designers add icons to the kit and engineers need them in code.
---

# Update the Font Awesome kit

You lead the operator through the process in `frontend/packages/fonts/README.md` ("Updating FontAwesome
Files"). Do every step you can yourself; stop and wait for the operator at each **GATE**. Never assume a
gate passed: ask, and continue only on an explicit yes. Do not batch gates.

What a finished update must contain (all of it, or the icons are not usable):

1. The kit's `css/` and `webfonts/` in `s3://cdo-dsco/assets/font-awesome-pro/<unix-ts>/`.
2. The new timestamp in `frontend/packages/component-library-styles/font.scss`,
   `frontend/packages/fonts/src/loader/index.ts`, `shared/css/font.scss`.
3. `kitIcons` in `frontend/packages/component-library/src/fontAwesomeV6Icon/constants/index.ts` matching the
   kit exactly. This is the only list of custom icon names; there is no separate TS type.
4. The custom icons storybook (`.../fontAwesomeV6Icon/stories/FontAwesomeV6Icon.story.tsx`, story "Group of
   Custom Icons") showing every icon in `kitIcons`, new ones included.

## Status

First real run (2026-10-07, v6 kit, `AWS_PROFILE=codeorg-contributor`) worked end to end: S3 upload, CORS
headers, URL bumps and `kitIcons` rewrite. The icon regex needed fixing against the real `custom-icons.css`
(`.fa-kit.fa-NAME`); if the added/removed lists look absurd, check it first.

## Steps

### 1. Operator downloads the kit (human only)

Tell the operator: sign in to fontawesome.com with the shared dev account, open "Code.org FontAwesome Kit v6
(Current)" (the repo is on v6; a v7 kit is uploaded archive-only: `update.mjs` detects it, uploads, and leaves repo files alone), Self-Host on the Web, "Download Web Files", and give you the zip path.

**GATE:** wait for the zip path. Check the file exists.

### 2. Check AWS access (you, then operator if it fails)

Run `aws --version` and `aws sts get-caller-identity`. Any AWS identity works if it has `s3:PutObject` and
`s3:ListBucket` on `cdo-dsco/assets/font-awesome-pro/*`; the script uses whatever credentials the CLI finds and
prints the active identity before it uploads. `AWS_PROFILE=codeorg-contributor` (role `Engineering_Contributor`)
is known to work. If another role gets AccessDenied, it needs those two permissions or should use that profile.
If this fails, tell the operator what is missing (CLI install, credentials, `AWS_PROFILE`).

**GATE:** if it fails, ask whether to fix access now or continue with `--skip-upload` and upload by hand
(step 5).

### 3. Preview (you)

`node .agents/skills/update-fontawesome-kit/update.mjs <kit.zip> --dry-run` prints the timestamp and the
added/removed icon names; it changes nothing. Show the operator the added and removed lists.

For every removed icon the dry run also prints `USED:` (with up to 10 matching lines) or `unused:`. It
matches the class `fa-<name>` and the bare quoted `'<name>'` (as in `iconName="<name>"`) in `apps/src`,
`frontend`, `dashboard/app`, `shared`, `pegasus`. Short or common names (`move`, `clever`) match unrelated
strings, so read each hit; a `USED` hit that is a real icon usage is a regression to fix or flag before the gate.

**If any removed icon has hits:**

1. Open each `USED` hit and classify it as a real usage or a false positive. Show the operator the real ones
   (file and line).
2. Check for a rename: a removed icon next to a similarly named added one (`ai-head-regular` -> `ai-head`).
3. A real usage blocks step 4, even if the operator says go. Ask them to pick: fix callers in the update PR
   (new name or another icon); keep the icon (ask design to restore it in the kit and stop here); or defer
   (apply anyway and open a follow-up; those spots render blank in production once the kit is live).
4. Say plainly that "unused" is not proof. Known gaps: class names built at runtime (`fa-${x}`) and usages in
   `dashboard/config` curriculum data are not searched, and only the five directories above are.

**GATE:** operator confirms the icon diff matches what design added (ask for names if unsure).

### 4. Apply (you)

Do not run this until the operator has explicitly confirmed the step 3 gate. A dry run alone is not consent.

Run the same command without `--dry-run` (add `--skip-upload` if step 2 chose it). It rewrites `../webfonts`
to the timestamped URL, syncs to S3, bumps the three URL files and rewrites `kitIcons`.

### 5. Manual upload, only if `--skip-upload` (operator)

The script prints the temp dir and the target prefix. Tell the operator to upload that dir's `css/` and
`webfonts/` to the printed `s3://cdo-dsco/assets/font-awesome-pro/<ts>/` prefix. Never delete older
timestamp folders; e.g. `apps/src/applab/Exporter.js` still pins one.

**GATE:** operator confirms the upload is done.

### 6. Verify the upload (you)

`curl -sI https://dsco.code.org/assets/font-awesome-pro/<ts>/css/custom-icons.min.css` must return 200 with
`access-control-allow-origin`. Same for `.../webfonts/custom-icons.woff2`. A missing CORS header means the
bucket CORS config needs fixing (see the README's Slack thread link); that is an operator/infra task.

**GATE:** if anything fails, stop and report; do not commit URLs that do not resolve.

### 7. Verify code and storybook (you, then operator)

- Confirm `git diff` touches exactly the three URL files and `constants/index.ts`.
- Run `yarn typecheck` in `apps/` and `./tools/hooks/pre-commit`.
- Storybook must show the new icons. Check the story reads `kitIcons` (it does at the time of writing) and,
  if you can run Storybook (`yarn dev` in `frontend/`), look at "Group of Custom Icons".

**GATE:** operator looks at the story and confirms every new icon renders (a blank square means the icon
name or the font URL is wrong).

### 8. PR (you)

The update PR must hold only the update, never skill edits (those go in their own PR). From a branch off
`origin/staging` named like `<user>/fontawesome-kit-update-<yyyy-mm>`:

- Stage exactly: the three URL files, `constants/index.ts`, and the story file if it changed.
- Title: `Update Font Awesome kit: <added icons, or "N new custom icons">`.
- Body: fill in `.agents/skills/update-fontawesome-kit/pr-template.md` (summary, added/removed icons table,
  before/after story screenshots, testing checklist). It needs: S3 prefix (`cdo-dsco/assets/font-awesome-pro/<ts>`), added and removed icons, usages found for removed
  icons, the step 6 check results, and before/after screenshots of the Custom Icons story (take them yourself
  with Storybook plus Playwright; "before" is `origin/staging`, "after" is the branch).
- Open as a draft into `staging`, then tell the operator the link.
