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

The S3 upload and the post-upload checks (CORS, `curl` of the new URL) have never been run: the author had
no bucket access. Everything else works with `--skip-upload`. After the first real run, delete this section
and fix whatever broke.

## Steps

### 1. Operator downloads the kit (human only)

Tell the operator: sign in to fontawesome.com with the shared dev account, open "Code.org FontAwesome Kit v6
(Current)", Self-Host on the Web, "Download Web Files", and give you the zip path.

**GATE:** wait for the zip path. Check the file exists.

### 2. Check AWS access (you, then operator if it fails)

Run `aws --version` and `aws sts get-caller-identity`. The role needs `s3:PutObject` and `s3:ListBucket` on
`cdo-dsco/assets/font-awesome-pro/*`. If this fails, tell the operator what is missing (CLI install,
credentials, `AWS_PROFILE`).

**GATE:** if it fails, ask whether to fix access now or continue with `--skip-upload` and upload by hand
(step 5).

### 3. Preview (you)

`node .agents/skills/update-fontawesome-kit/update.mjs <kit.zip> --dry-run` prints the timestamp and the
added/removed icon names; it changes nothing. Show the operator the added and removed lists.

If icons are removed, `grep -rn "fa-<name>" apps frontend dashboard/app shared pegasus` for each and report
usages: removing a used icon is a regression.

**GATE:** operator confirms the icon diff matches what design added (ask for names if unsure).

### 4. Apply (you)

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

Commit, push, open a draft PR into `staging`. Body: timestamp, added/removed icons, and a screenshot of the
story if the operator provides one. Do not stage unrelated files.
