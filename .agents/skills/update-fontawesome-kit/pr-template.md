## Summary

<!-- 1-3 bullets: which kit was applied and what changed in the repo. -->

- Applies the Code.org FontAwesome Kit v6 upload at `cdo-dsco/assets/font-awesome-pro/<ts>`.
- Bumps the timestamp in `component-library-styles/font.scss`, `fonts/src/loader/index.ts` and `shared/css/font.scss`.
- Syncs `kitIcons` (`fontAwesomeV6Icon/constants/index.ts`), which the Custom Icons story renders.

## Icons

| | Icons |
| --- | --- |
| Added (N) | `name-one`, `name-two` |
| Removed (N) | `name-three`, or "none" |

Usages of removed icons: <!-- result of the grep in SKILL.md step 3, or "none found" -->

## Storybook: Design System / FontAwesomeV6Icon / Group of Custom Icons

| Before (`staging`) | After (this PR) |
| --- | --- |
| <!-- screenshot --> | <!-- screenshot --> |

## Testing

- [ ] `custom-icons.min.css` and one woff2 under the new prefix return 200 with `Access-Control-Allow-Origin`
- [ ] Every added icon renders in the story above (no blank squares)
- [ ] `yarn typecheck` in `apps/` and `./tools/hooks/pre-commit`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
