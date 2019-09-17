# Apps Build System

The apps build system generates all the client side javascript files used on
studio.code.org. This file contains documentation about how it works and how it
can be configured for different needs.

## FAQ

### Why do we bundle javascript files? What are the goals?

Fundamentally, the purpose of bundling is to speed up page load times by
decreasing the number of files that the browser has to download for the page to
work. Between our own code and third party code, there are over 1300 individual
javascript files needed to run any given web page. By bundling these files
together (via concatenation) we reduce the number of javascript files the
browser needs to download to less than 5.

### What is our strategy for bundling?

code.org is a very complex application with a lot of moving parts. Bundling is
done in a way that balances performance with maintaining our own sanity as
developers.

Here are the constraints of the system that have lead us to our current bundling
implementation/strategy:

1. Rails is responsible for all url routing. That means each browser navigation
   to a url is going to be a full page load with it's own unique set of
   javascript dependencies. Changing this would take an enormous amount of
   effort.

2. Somes pages served by rails are very simple and require very little
   javascript, if any, such as the home page and other marketing oriented pages.

3. Other pages served by rails are very complicated and require _a lot_ of
   javascript to work, such as the applab development environment.

4. The exact javascript code required by different pages can have significant
   overlap, both in terms of the third party libraries that get used, and in
   terms of code.org's internal javascript.

5. Visitors to the complicated pages (such as applab, gamelab, etc) typically
   visit those pages multiple times per browsing session, and across multiple
   days, since many of them are students and teachers in a regularly scheduled
   class.

6. Visitors to the marketing pages come from all over the world and have all
   different sorts of internet connections (both in bandwidth and
   latency). Chances are pretty good that they have not visited these pages
   recently if ever, though once they do visit them, they typically visit many
   of them in a row.

7. We deploy a new version of the site, which always includes javascript
   changes, 5 days a week, every week.

With these constraints in mind, here are the high level guidelines we shoot for
when configuring our bundles:

- _DO_ try to factor out code used on more than one page into a shared bundle to
  improve client-side cache efficiency.
- _DO NOT_ try to factor out _all_ code used on more than one page into a single
  shared bundle to reduce the total number of bytes that must be downloaded for
  any given page on a cache miss.
- _DO_ try to factor out code that rarely changes into a single bundle that can
  be cached for a long time on the client across multiple production
  deployments.
- _DO_ try to factor out code that is used on multiple pages which are often
  visited in succession.
- _DO_ try to have a small number of bundles for any given page (<= 5)

Currently, the outcome of applying these guidelines as best we can is the
following:

- `minimal.js` - this bundle includes code that is used pretty much everywhere
  on the site. It will get loaded on every page and (hopefully) doesn't change
  that often.

- `code-studio-common.js` - this bundle includes code that is used on all
  studio.code.org pages, but which isn't already in `minimal.js`. So any page
  that needs `code-studio-common.js`, also needs `minimal.js` to work.

- `common.js` - this bundle includes code that is used across all of the big
  apps (gamelab, applab, etc.) but which isn't already in `minimal.js` or
  `code-studio-common.js`.

Then there are a bunch of much smaller bundles which serve as the "entry points"
for various pages. They contain code which isn't used anywhere else and is
really only for one specific page. So in theory, even the heaviest pages should
only require downloading 4 different javascript files.

### When should I create a new bundle?

The only time you should create a new bundle is when you are creating a new
rails page at a new url. If you are creating lots and lots of these pages, then
it _might_ be reasonable to create a new common chunk bundle, but this should be
considered carefully before being implemented.

### How do I create a new bundle?

Creating a new bundle is easy, but you need to think about what that bundle's
dependencies will be. Here are the different options:

1. I'm creating a new code studio "app" like applab/gamelab/etc.

   Add the name of your app's directory to the `ALL_APPS` array in
   `Gruntfile.js` and make sure the directory contains a `main.js` file. The build
   system will then generate a new bundle for that app with the same name as the
   directory, using `main.js` as the entry point. Code shared with other apps will
   be factored out into `common.js`.

2. I'm creating a new code studio page that isn't an app.

   Add a new key/value into the `codeStudioEntries` object in `Gruntfile.js`. The
   key will become the bundle's filename and the value is the file to generate the
   bundle from. Any code used by your new file which is used by other entries in
   `codeStudioEntries` will be automatically factored out into the
   `code-studio-common.js` file.

3. I'm creating a new "marketing" page that doesn't have a lot of dependencies.

   Add a new key/value pair to the `otherEntries` object in `Gruntfile.js`. All
   dependencies will be included in the new bundle whether or not they are also
   used by other bundles.

## Brief Production Build Overview

The apps build system works in conjunction with the rails asset pipeline that is
configured in the dashboard app. Our deployment scripts in turn use files
generated by the asset pipeline to seed our CDN with all the static assets
required by the production application.

### From `npm run build:dist` to a CDN deployment

When production assets are being built, a bunch of different tools with
different configurations get run. Here is the approximate flow of commands/files.

1. `npm run build:dist` - This is the entry point into the build system, and is
   the command used to build production javascript assets. It should be run from
   inside the `apps/` directory. All this does is execute grunt's `build` task as
   defined in `Gruntfile.js`

2. The grunt `build` task - This delegates to the various `webpack` tasks which
   do all the actual work. There are a few extra steps in here that copy around
   files that are not (yet) processed by webpack (scss, images, etc.)

3. The grunt `webpack` tasks - There are three different webpack tasks depending
   on what you are doing. When building for production, the `webpack:build` and
   `webpack:uglify` tasks get run. They do pretty much the same thing except
   that `webpack:uglify` also minifies the generated bundles.

4. The `webpack:(build|uglify)` task(s) - Theses tasks run webpack with a
   configuration that generates a bunch of javascript files called
   "bundles". The bundles fall into two different categories: 1) entry point bundles,
   and 2) commons chunk bundles. Entry point bundles contain the code which
   gets executed when the page loads. Commons chunk bundles contain library code
   that is shared between multiple entry point bundles.

   All of these files are written to the `apps/build/package/js/` directory. You
   will fine three files for each bundle: 1) an unminified bundle (like
   `applab.js`), 2) a minified version of the same bundle (like `applab.min.js`)
   and 3) a sourcemap for the minified bundle (like `applab.min.js.map`).

   The exact configuration used by webpack is defined in `apps/Gruntfile.js` and
   `apps/webpack.js`.

5. `rake assets:precompile` - This is a ruby on rails rake task which
   generates/compiles *all* the static assets (including images, css, js, etc.)
   using the rails asset pipeline. It should be run from the `dashboard/`
   directory. The configuration for this asset pipeline is spread out between
   `dashboard/config/application.rb` (see the `config.assets` lines) and
   `dashboard/config/environments/production.rb`.

   The rails asset pipeline can be configured to do bundling and minification,
   but it is a significantly less powerful tool than webpack. As a result, we
   only use the rails asset pipeline to add "digests" to the filenames. In
   effect, the `assets:precompile` rake task just copies over all the files that
   were generated by webpack, adding a unique digest hash to the
   filenames, and constructing a manifest file with the mapping. You can find
   all these files in `dashboard/public/assets/`.

   When loading a bundle with a script tag inside an erb or haml
   file, rails will automatically add the unique digest to the url by looking at
   the manifest file generated during precompilation. The manifest file is
   stored at
   `dashboard/public/assets/.sprockets-manifest-<some-unique-hash>.json`

6. `assets:sync` - This step is actually run whenever `rake assets:precompile`
   is run. It uploads everything in `dashboard/public/assets/` to an S3
   bucket. Cloudfront then serves those files directly from the S3 bucket.

### Replicating production behavior locally (long way)

Sometimes, bugs may show up only in production (or circle ci) and not locally
under development configurations. Usually these bugs are related to the build
system. To get them to repro, you need to configure your local environment to
work more like production. Here are the steps to do that:

1. Edit `dashboard/config/environments/development.rb` by changing `config.assets.digest` to
   `true` and `config.assets.compile` to `false`. Edit `locals.yml` by setting `pretty_js` to
   `false`. This will make the rails app and pegasus look for minified js files that have
   already been processed by the rails asset pipeline.

2. Run `npm build:dist` inside the `apps` directory. This will generate all the
   production assets used by the dashbaord app.

3. Run `rake assets:precompile` inside the `dashboard` directory. This copy all
   the necessary files into `dashboard/public/assets`.

4. Restart the dashboard server `./bin/dashboard-server` from the root folder.

If you make any changes to the build configuration or the javascript files, you
will need to redo steps 2-4. Relying on watch mode won't work. If you are having
a hard time wrapping your head around the minified bundles which get used with
this configuration, you can try changing `pretty_js` back to `true`
so that the unminified files get served instead.

### Replicating production behavior locally (short way)

If you believe that the production behavior you are observing has only to do with the js being minified and not with the dashboard asset pipeline, you can quickly build minified JS locally by running `npm run build:dist:debug`. **WARNING** this will output minified js with the `.js` suffix, without the `.min` suffix. If you do this, it's on you to remember to do a regular `npm run build` to get back into a normal state.
