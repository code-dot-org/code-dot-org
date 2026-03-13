# studio.code.org / aka dashboard: code.org's K-12 CS and AI education platform for all kids and teachers

## Basic facts about this monorepo:
- implements code.org's curriculum supporting our mission of K-12 CS and AI education.
- lives at https://github.com/code-dot-org/code-dot-org
- deployed in production as https://studio.code.org, but usually we call it "dashboard" internally
- broadly contains teacher tools, student labs (=learning activities), and levelbuilder (curriculum authoring tool)
- key directories:
  - frontend is React, see apps/, particularly apps/src (most existing jsx/tsx), and frontend/ (some new modules)
  - backend is Rails, see dashboard/ which is the root of a conventional Rails app 

## A few other useful docs:
- apps/README.md: how to run/build/test our frontend JS/TS/JSX/TSX
- TESTING.md: how to run various types of tests, both frontend, backend and ui tests
- Assorted docs are scattered through the repo, most as .md files, you may find these relevant as you work in different parts of the repo

## Rails Tips and Tricks:
- As previously mentioned, see `dashboard/` directory for a conventional rails app with the usual directories (i.e. with dashboard/app/controllers, dashboard/app/models, dashboard/bin/rails, etc)
- Some non-rails ruby code also lives in `lib/`
- We use CanCanCan for authorization and Devise for authentication
- Use `bundle exec` to run ruby commands (exception: most ./bin/* commands automatically load the rails environment)
- To execute/test Ruby / Rails code snippets (recommended!), use `./bin/rails runner` from the `dashboard/` directory.
- `./bin/mysql-client-dashboard-reader` can be used to safely query the local db with SQL commands
- `./bin/mysql-client-dashboard-writer` is also available, but is not safe and usage should be approved by the user first
- `config/*.yml.erb` (e.g. `config/development.yml.erb`) contains per-rails-env configuration, also related to local config keys settable in locals.yml. API keys, passwords, etc are often set using this system.
- Running all rails tests takes about 15 minutes, probably don't do it unless the user asks you to.
- Testing: for a fast iteration dev/feedback loop, consider using e.g. `bundle exec spring testunit ./test/lib/image_lib_test.rb` (run from dashboard/) to run individual ruby tests
- Linting: run `./tools/hooks/pre-commit` which only lints modified files (=fast, run frequently). You should definitely run this before reporting success to the user if you've changed any js/ts/jsx/tsx/ruby.

## React Tips and Tricks:
- As previously mentioned, see `apps/` for most (but not all) of our existing JS/TS/JSX/TSX code
- Some new code is being added in `frontend/`, using standalone/modular JS packages. In the future we plan to use this more and more.
- In contrast, `apps/` is basically one giant webpack bundle
- Much of our javascript code is used to implement "labs", which you can think of as "game engines" for our various curriculum content.
  - A single lab will be used in lots of levels, each level is an educational experience written by our curriculum authors
  - Lab2: newer labs like music lab (`apps/src/music/`), weblab2 (`apps/src/weblab2`) and pythonlab (`apps/src/pythonlab`) are implemented around the lab2 framework (found in `apps/src/lab2) and are mostly written in TypeScript + React.
    - TIP: if you're starting a new lab, use lab2
  - Older labs (like applab `apps/src/applab`) are often written in Javascript + React, and often more archaic styles. Match style when working on maintenance of older labs.
  - There are MANY more labs we haven't mentioned in `apps/src/[labnamehere]`, and many of the sub-directory also relate to interfaces for teachers ("teacher tools")
  - Testing: for a fast iteration dev/feedback loop, consider using e.g. `yarn test:unit test/unit/gridUtilsTest.js` (run from apps/) to run individual js tests
    - Running all tests: running `yarn test` in `apps/` runs the full JS suite, which takes ~5 minutes, maybe don't run it unless the user asks you to.
  - Linting: run `./tools/hooks/pre-commit` which only lints modified files (=fast, run frequently). You should definitely run this before reporting success to the user if you've changed any js/ts/jsx/tsx/ruby.
  - Type Checking Typescript: run `yarn run typecheck` in `apps/`.
    - Note that linting does not check ts/tsx types, so you may frequently run both typecheck and lint in combo.
    - If you're modifying ts/tsx, you should typecheck regularly
    - It takes ~10s to typecheck, so it can be run too frequently too.
    - A good litmus test is if you've made a batch of changes, or before reporting success to the user, run `yarn run typecheck` first.

## Design System (`@code-dot-org/component-library`)
- Our design system lives in `frontend/packages/component-library/` (React components, TypeScript) with shared styles in `frontend/packages/component-library-styles/` (colors, typography, mixins).
- **Always prefer design system components** over legacy ones in `apps/src/sharedComponents/` or `apps/src/legacySharedComponents/`. Only use legacy components when no design system equivalent exists. Never create custom UI primitives (buttons, modals, alerts, etc.) when a design system component is available.
- Available components include: Accordion, ActionBlock, Alert, Breadcrumbs, Button/LinkButton, Carousel, Checkbox, Chips, Dialog, Divider, Dropdown (action, checkbox, icon, simple), FontAwesomeV6Icon, Header, HeroBanner, Image, Link, List, Modal, NotificationBanner, Popover, RadioButton, SegmentedButtons, Slider, Snackbar, Tabs, Tags, TextField, Toggle, Tooltip, Typography, Video, and more.
- Import pattern: `import Checkbox from '@code-dot-org/component-library/checkbox';`
- Each component has a JSDoc status header (`Stable`, `Ready for dev`, `WIP`, `DEPRECATED`) -- check it before using.
- For full API reference, check the component source or Storybook at https://code-dot-org.github.io/code-dot-org/component-library-storybook
- Use **SCSS modules** (`.module.scss`) for all component styling. Never use inline styles or global styles.
- **Color priority**: always use semantic colors (`@code-dot-org/component-library-styles/colors.scss`) first, then primitive colors (`primitiveColors.scss`) second, then other colors only as last resort.
- Semantic colors are CSS variables (e.g., `var(--text-neutral-primary)`) that support light/dark theming via the `data-theme` attribute.
- **Never rely on stylesheet load order** for specificity. Always use CSS selector specificity rules.
- Override component styles via parent element selectors or component-specific class selectors in SCSS modules.
- For typography, use MUI's `<Typography>` component (DSCO Typography is deprecated). Font variables are in `@code-dot-org/component-library-styles/fontVariables.css`.
- When building new design system components, see `frontend/packages/component-library/CONTRIBUTING.md` and `README.md` for the full contribution process and best practices.

### DSCO-to-MUI Migration (in progress):
- We are gradually migrating from our custom design system (DSCO / `@code-dot-org/component-library`) to MUI (`@mui/material`). Before using a DSCO component, check whether it has been deprecated (look for `@deprecated` or `DEPRECATED` status in its JSDoc header) and whether MUI style overrides already exist for it in `frontend/packages/component-library/src/themes/code.org/styleOverrides/`.
- **Migration status doc**: see `frontend/packages/component-library/MIGRATION_STATUS.md` for the full per-component migration status table.
- **Already migrated (deprecated)**: Typography, Button/LinkButton/GenericButton, Breadcrumbs. Use MUI equivalents directly.
- **Button**: codemod available (`yarn codemod:buttons` from component-library/). See `src/button/BUTTON_MIGRATION_TO_MUI.md` for the full migration guide.
- **MUI theme**: our custom MUI theme (`CdoTheme`) lives in `frontend/packages/component-library/src/themes/code.org/` and is applied via `<ThemeProvider theme={CdoTheme}>`. It defines custom typography variants, button sizes/colors, and uses CSS variables for light/dark theme support.
- **MUI type augmentation**: custom MUI types (extra button sizes, colors, typography variants, etc.) are declared in `frontend/packages/component-library/types/mui.d.ts` and must be manually synced to `apps/src/types/mui.d.ts`.
- **Decision guide for which component to use**: if a DSCO component is deprecated or has MUI style overrides in the theme, use the MUI equivalent. Otherwise, continue using the DSCO component until its MUI migration is ready.

## Levelbuilder
- An important part of dashboard conceptually is "levelbuilder", which is used by curriculum authors to, well, write curriculum also called "levels".
- Levelbuilder is mostly implemented in rails, but with some react views
- Levelbuilder lets curriculum authors write "levels" that are like config files for frontend "labs"
- curriculum is stored in several sub-directories of dashboard/config each of which have thousands or more files under them like:
  - dashboard/config/courses/*.course
  - dashboard/config/course_offerings/*json
  - dashboard/config/scripts contains a variety of curriculum related files with a nested directory structure
  - dashboard/config/scripts_json/*.script_json
  - etc
  
## Other potentially interesting directories

- `aws/`: contains IaC, in particular `aws/cloudformation`
- `cookbooks/`: contains chef cookbooks used to manage low level infrastructure on our production servers ("prod, staging, test") and adhocs

## General Tips and Tricks:
- This is a fairly large monorepo, so be mindful about getting lost and filling your context with unrelated files
- Testing:
  - Running our whole test suite (backend, frontend, and especially UI tests) can take quite a while, so running targeted test subsets is recommended in dev loops
  - When a commit is pushed to a GitHub PR, our CI "drone" runs on it. A drone run takes about 30 minutes to an hour.
- Linting:
  - Because this is a fairly large monorepo, running full lint of all files can be really slow (e.g. `yarn lint` in apps/ takes about a minute ).
  - Therefore: THE BEST WAY TO LINT is to run (from the repo root): `./tools/hooks/pre-commit`. This will run the pre-commit git hooks which lint both ruby and js/ts/jsx/tsx files, but only those that have been changed. Do this regularly after you make changes, its usually very quick.
- IGNORE the pegasus/ directory unless explicitly instructed, it is big and mostly deprecated
- Because the repo started in 2013, there's a wide range of styles and versions of tech in use. Generally, match your style to the current project/directory you are working in. When in doubt lean toward a more modern approach but don't push it either (e.g. if the directory currently uses JS, probably default to writing JS not TS)
- In local development, dashboard+apps is most commonly available as http://localhost:9000 (try this first, webpack dev server proxy with react hmr, i.e. `yarn start` is running) or if port :9000 isn't available, try http://localhost:3000 (direct to rails, a static `yarn build`, just dashboard)
  - Sometimes the dashboard will already be started by the user and will be already running, as it takes a while to start and stop
  - However, if dashboard has not been started you may want to ask the user if you should start it when appropriate/useful:
    - To start the rails backend: run `bin/dashboard-server` from the repo root (aka "start dashboard")
    - To start the react devserver: run `yarn start` from apps/ (aka "start apps")
    - These will not return
    - For frontend work both will need to be running. Some backend work can be done only with Rails running.
- the main branch of this repo is named `staging`. to see what work exists in a feature branch, assume `staging` is the base branch for that work unless otherwise noted.

## Test strategy during the dev loop
- find and run all the unit tests you can identify as relevant before running any full test suites
- next, test as much as you can with rails runner, mysql commands, in the browser, etc (as relevant)
- finally, if there's a relevant test suite, run it
- once you've done all that, if you need any testing that requires the UI or secrets, or you're ready for a full drone run, let the user know what you'd like tested that you could not test on your own

# Agent skills
- Add agent skills to the `.agents/skills` directory shared by all agents.
- Skill directories matching `.agents/skills/*.local` are not committed to git.
- Prefer adding agent skills to extending AGENTS.md.
