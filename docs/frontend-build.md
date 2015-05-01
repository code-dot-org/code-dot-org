# Frontend build pipeline

A new frontend build pipeline was added in April 2015.

## What changed

High-level overview:

- Split out the JavaScript dependency graph into multiple CommonJS packages (directories containing a `package.json` file)
  - /package.json
  - /apps/package.json
  - /apps/src/package.json
  - /shared/js/example/package.json (this serves as an example project with its own npm package definition and build steps)
- Use [`npm` lifecycle scripts](https://docs.npmjs.com/misc/scripts) to define a set of build tasks common to all packages:
  - `npm install`: Install dependencies
  - `npm run build`: Compile the project's files and create build artifacts
    - Set npm [production mode](https://docs.npmjs.com/misc/config#production) to output compressed artifacts, e.g., `npm run build --production`
  - `npm start`: Run incremental-build watchers, and any other JavaScript-development services (e.g., localhost:8000 for /apps)
  - `npm test`: Run the default tests for the project
- Implement complex build tasks using Gulp interface (/lib/frontend/gulpfile.js, /apps/gulpfile.js)
- Refactor /apps test harness to use Browserify+PhantomJS for running tests instead of NodeJS+JSDOM
  -This removes a lot of complicated code, and removes a difficult-to-compile dependency on node-canvas
- Automatically integrate simple JavaScript sources via JSON-configuration (/lib/frontend/pipeline-config.json)
- Update CI system to use the new /apps build process
  - Removed /apps-package from the repository: now the CI system extracts a tar.gz file from S3, and development environment uses incremental builds

### Running development-mode server

To run an all-in-one development-mode server you can use the `./up` script, which does the following:

- Check/update all Ruby dependencies (via `bundle install`)
- Check/update all JavaScript dependencies (via `npm install`)
- Run the Ruby server and any associated incremental-build watching (via `bin/dashboard-server`)
- Run any Javascript incremental-build watching (via `npm start`)

### Running /apps standalone

`cd` to `/apps` and run `npm install` to install dependencies, `npm run build` to compile output files, or `npm start` to run the local server and incremental builds.
