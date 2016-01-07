# shared/js

This is a set of files shared between different projects. The non-angular related js files in here get bundled into a browserified js file that lives in cdo/dashboard/public/shared.

Commands can be run via npm, i.e. `npm run <command>`
`build` Generates the bundle
`clean` Removes built files
`lint` Runs the linter
`dev` Build, and runs in watch mode, subsequently building each time there are changes
`gulp` Do everything. Can also run arbirary gulp tasks using `npm run gulp -- task`

By default, dashboard will use in the version of the generated bundle that is checked in. In order to use your local version, you'll need to add `use_my_shared_js: true` to your code-dot-org/locals.yml file and run `rake install:shared` from the root directory.
