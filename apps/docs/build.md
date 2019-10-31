# Apps Build System

The apps build system generates all the client side javascript files used on
studio.code.org. This file contains documentation about how it works and how it
can be configured for different needs.

## FAQ

### Why do we bundle javascript files? What are the goals?

One purpose of bundling is to speed up page load times via a number of
techniques. Another purpose is to make our product compatible with older
browser versions via transpilation.

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
   will fine one file for each bundle: either (1) an unminified bundle (like
   `applab.js`), or (2) a minified, hashed version of the same bundle (like 
   `applabwp0123456789abcdef0123.min.js`).

   The exact configuration used by webpack is defined in `apps/Gruntfile.js` and
   `apps/webpack.js`.

5. `rake assets:precompile` - This is a ruby on rails rake task which
   generates/compiles *all* the static assets (including images, css, js, etc.)
   using the rails asset pipeline. It should be run from the `dashboard/`
   directory. The configuration for this asset pipeline is spread out between
   `dashboard/config/application.rb` (see the `config.assets` lines) and
   `dashboard/config/environments/production.rb`.

   The capabilities of the rails asset pipeline overlap significantly with those
   of webpack. In attempt to keep things simple, our current design is to do as
   much asset management work as possible in webpack and as little as possible
   in rails. As a result, we only use the rails asset pipeline (1) to add
   "digests" to assets which do not already contain hashes generated by webpack,
   and (2) to retain each asset (whether hashed or digested) for a few deploys
   so that links to them do not break immediately after each deploy.
   
   More specifically, the `assets:precompile` rake task does the following:
   
    * copies over all the files that were generated by webpack
    * generates application.js and application.css and copies them over (along
    with a few other non-webpack files which will soon be moved into webpack)
    with a unique digest added to the filenames
    * constructs a sprockets manifest file which is used only for looking up
    non-webpack assets.
     
   You can find all these files in `dashboard/public/assets/`.
   
   the `assets:clean` step eliminates all but the newest few copies of each
   asset in the `dashboard/public/assets/` directory.
   
   When loading an asset in dashboard or pegasus in production via the
   `webpack_asset_path` helper, the helper will look in the webpack manifest to
   determine the full path of the asset to load, including the content hash.
   This is the preferred method for loading an asset.

   When loading a bundle inside an erb or haml file via `asset_path`,
   `stylesheet_link_tag`, or `javascript_include_tag`, rails will automatically
   add the unique digest to the url by looking at the sprockets manifest file
   generated during precompilation. The sprockets manifest file is stored at
   `dashboard/public/assets/.sprockets-manifest-<some-unique-hash>.json`. These
   3 helpers are deprecated in favor of processing via `webpack_asset_path`
   instead. A prerequisite changing assets to be loaded via `webpack_asset_path`
   is to start processing them via webpack to assign them a content hash. All
   uses of the 3 deprecated helpers are scheduled to be eliminated asap, except
   for those which point to application.js and application.css.

6. `assets:sync` - This step is actually run whenever `rake assets:precompile`
   is run. It uploads everything in `dashboard/public/assets/` to an S3
   bucket. Cloudfront then serves those files directly from the S3 bucket.

### Using minified js locally

In some cases, production behavior will differ from development or CI because
we use minified JS in production. To build minified js locally, you can do 
the following:

0. Make sure you have `build_apps: true` and `use_my_apps: true` in locals.yml.

1. set `optimize_webpack_assets: true` in locals.yml. This will make dashboard and pegasus
   use the webpack manifest to find your js assets (which now have content 
   hashes in the filename) rather than looking for unhashed filenames.

2. From the apps directory, run `yarn build:dist` or `yarn build:dist:debug`.
   The latter takes longer but will generate source maps, which will let you
   step through minified js in the debugger as though it was not minified.

3. Restart `./bin/dashboard-server` from the root folder of the repository.

If you make any changes to the build configuration or the javascript files, you
will need to repeat steps 2 and 3. Relying on watch mode won't work.

To get back into a normal state, run `yarn build`.

### Using rails asset pipeline locally

To further approximate production behavior locally, you can use the rails asset
pipeline to precompile all assets locally. Once you have built minified js
locally as described above, here are the additional steps:

1. Set `optimize_rails_assets: true` in locals.yml. 
   This will make the rails app look for js files and other assets that have
   already been processed by the rails asset pipeline.

2. Run `rake assets:precompile` inside the `dashboard` directory. This will copy
    all the necessary files into `dashboard/public/assets`.

3. Restart `./bin/dashboard-server` from the root folder of the repository.

If you make any changes to the javascript files, you will need to repeat step 2
from the previous section as well as steps 2 and 3 from this section.

To get back into a normal state, you must run `cd dashboard ; rake assets:clobber`, 
or simply `rm -rf dashboard/public/assets`.
