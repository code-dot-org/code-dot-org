# Testing

If you're new to code.org, try getting these tests working first:
1. [Apps Tests](#apps-tests)
2. [Dashboard Tests](#dashboard-tests)

Before running tests, you should follow the [setup guide](./SETUP.md).

## Kinds of tests

We use automated tests to maintain quality in our codebase. Here's an overview of the kinds of tests we use, and how to run them:

* Apps directory
  * Unit Tests - Used to test client-side functionality of some of our levels, applab, and applab controls
  * Integration Tests - Used to test level solutions and some block behaviors
* Dashboard directory
  * Ruby tests - All of the server side business logic testing is through here.
  * UI tests - Used to test overall functionality. Intended to run across browsers. Runs either on Saucelabs or with a local Chromedriver
    * Eyes tests - Subset of UI tests intended to test the precise layout of controls on certain UI pages. Eyes tests are run through Applitools and work by comparing an expected screenshot to an actual screenshot of a certain page. Eyes tests only run on Chrome for now. If you make a change that affects layout, you will likely break eyes tests. Work with whoever is reviewing your PR to figure out if the layout change should be accepted, and the baseline will be adjusted.
 * Shared and Lib directories
   * Ruby tests - Unit tests over Ruby code in the shared and lib directories.
* Pegasus directory
  * Ruby tests - Test server side logic, caching, graphics, etc.

### When tests are run

<!---- Can use http://markdowntable.com/ for reformatting help --->

|                        | ruby lint                 | scss lint                         | haml lint          | stylelint                | JavaScript eslint (everywhere) | apps test          | dashboard unit tests | UI tests (Chrome)  | UI tests (all browsers) | eyes UI tests      | pegasus unit tests | shared and lib unit tests  |
|------------------------|---------------------------|-----------------------------------|--------------------|--------------------------|--------------------------------|--------------------|----------------------|--------------------|-------------------------|--------------------|--------------------|--------------------|
| pre-commit hook        | changed `*.rb and #!ruby` | changed `dashboard/app/**/*.scss` | changed `*.haml`   | changed `apps/**/*.scss` / changed `*.js`                 |
| circle CI (via github) |                           |                                   |                    |                          | :white_check_mark:             | :white_check_mark: | :white_check_mark:   | :white_check_mark: |                         |                    | :white_check_mark: | :white_check_mark: |
| staging build          | :white_check_mark:        |                                   | :white_check_mark: |                          |                                | :white_check_mark: |                      |                    |                         |                    |                    |                    |
| test build             |                           |                                   |                    |                          |                                |                    | :white_check_mark:   | :white_check_mark: | :white_check_mark:      | :white_check_mark: | :white_check_mark: | :white_check_mark: |

## Running tests


### Top-level Test Helpers

Our top-level `lib/rake/test.rake` file contains a handful of tasks that can be used to start tests for our different sub-projects. A full, up-to-date list of these can be found by running `bundle exec rake --tasks | grep test:`.

Worth noting:

* `bundle exec rake test:all` - runs all tests across all sub-projects
* `bundle exec rake test:apps`, `bundle exec rake test:pegasus`, `bundle exec rake test:blockly_core` ... etc  - runs tests for specific sub-project
* `bundle exec rake test:changed` - detects which sub-projects have changed in this branch, runs those tests
* `bundle exec rake test:changed:apps` - runs apps tests if sub-project folder has changed
* `bundle exec rake test:dashboard` - runs dashboard tests, but see [Dashboard Tests](#dashboard-tests) below for first time setup
  

### Apps Tests

`yarn test` will lint all of the apps code and run unit and integration tests. Run this from the `apps/` directory. You can expect a full test run to take about 4-8 minutes.

It's also possible to run a subset of tests:

* `yarn lint`
* `yarn test:unit`
* `yarn test:integration`
* `yarn test:unit test/unit/gridUtilsTest.js`

For more details, see [apps/README.md](./apps/README.md#testing).

### Dashboard Tests

Dashboard tests commands below should be run from the `dashboard/` directory: 

`cd dashboard`

Before running dashboard tests for the first time, run these commands to seed the required test data

1. `RAILS_ENV=test bundle exec rake assets:precompile`
2. `RAILS_ENV=test UTF8=1 bundle exec rake db:reset db:test:prepare` : seed the DB with test data
3. `cd ../pegasus && RAILS_ENV=test bundle exec rake test:reset_dependencies && cd ../dashboard` : the pegasus test DB must be seeded as well.

To run all dashboard tests, which takes about 15 mintues:

`RAILS_ENV=test bundle exec rails test`

If you have trouble running the tests, see [troubleshooting dashboard tests](#troubleshooting-dashboard-tests) below.

#### Running a subset of Dashboard tests

If you just want to run a single file of tests
`bundle exec spring testunit ./path/to/your/test.rb` 
(if you get a seemingly unrelated error `Unable to autoload constant..` try running `spring stop` and trying again)

To run a specific unit test
`bundle exec spring testunit ./path/to/your/test.rb --name your_amazing_test_name`
The test name is `test_` concatenated with the name of the test listed in the test file (convert spaces to underscores). Ex: If the test is called "testing some unit" you would use `--name test_testing_some_unit`.

You can get a local coverage report with
`COVERAGE=1 bundle exec ruby -Itest ./path/to/your/test.rb`



### UI Tests and Eyes Tests
We have a set of integration tests, divided into "UI tests" (Selenium+Cucumber) and "Eyes tests" (Selenium+Cucumber+Applitools).  These tests live in [dashboard/test/ui](dashboard/test/ui) - for information on setting up and running these tests, see [the README in that directory](dashboard/test/ui/README.md) and our [guide to adding an eyes test](docs/testing-with-applitools-eyes.md).
Or you can just use this shortcut (after you've installed chromedriver):

`bundle exec rake test:ui feature=dashboard/test/ui/features/sometest.feature`

#### Running eyes tests from Drone CI

If you'd like our CI to run all eyes tests on your PR using Saucelabs, include the string "[test eyes]" in your commit message.

### Shared and Lib Tests
Tests in the `shared/` and `lib/` directories need to be run slightly differently since they are outside of our Rails environment.

To run a test file in either directory, `cd` into it before running the tests.

```bash
cd shared
bundle exec ruby -Itest ./test/path/to/your/test.rb
``` 

### Pegasus Tests
`cd pegasus && rake test` will run all of our pegasus Ruby tests. This usually takes ~20 seconds to run.

Pegasus tests depend on the `pegasus_test` database.  If you have database-related errors, you can recreate and reseed the test database with `RAILS_ENV=test rake test:reset_dependencies`.  This will take about four minutes.  (Note that this must be run from the `pegasus/` directory.  Also note that in some environments, `bundle exec` should be included like this: `RAILS_ENV=test bundle exec rake test:reset_dependencies`.)

Pegasus tests also depend on some local utilities being installed.  See [SETUP.md](SETUP.md) and make sure you have `pdftk` and `enscript` installed.

To run one test file in pegasus, run `rake test TEST=<path-to-test-file>` (e.g. `rake test TEST=test/test_dev_routes.rb`).

### Dealing with test failures (non-Eyes)
Our tests are pretty reliable, but not entirely reliable. If you see a test failure, you should investigate it and not immediately assume it is spurious.

Take a look at the Saucelabs replay. You can view a list of recently run tests on Saucelabs and find your error - alternatively, you can run tests with the --html or --verbose option and see a URL. Saucelabs should have a video replay of what the test looked like. If you see something like a certificate error (common when testing on localhost) or a complete CSS breakdown (sometimes specific to IE9) then this is probably because of a flakey test and its safe to ignore. Most other failures do need to be addressed.

### Dealing with test failures (eyes)
If you've made a change that caused an eyes failiure, log into Applitools and check out the replay. You can see highlighted areas indicating what parts are different. If you've done something that changes the layout, images, or text, that may cause an eyes failure. Confirm with another team member that this is okay, and you can accept the new appearance as the baseline for future tests.

## See Also

* [Testing Production Locally](docs/testing-production-locally.md)
* [Testing IE9](docs/testing-ie9.md)

# Troubleshooting

## Troubleshooting dashboard tests

1. If you get a bunch of complaints about database, like missing tables or how some tables haven't been seeded, here are some things you can try in order from least to most drastic before running your tests again:

    1. `RAILS_ENV=test bundle exec rake seed:secret_pictures seed:secret_words`
    
    2. Stop spring process (which can sometimes have stale data) and then rerun the tests, which will automatically start a new instance of spring.
      `spring stop` 

    3. recreate your local dashboard test db and reseed the data via:
        * `UTF8=1 RAILS_ENV=test bundle exec rake db:reset db:test:prepare`
        * if you forgot to specify `UTF8=1`, fix it by running: `echo "ALTER DATABASE dashboard_test CHARACTER SET utf8 COLLATE utf8_unicode_ci;" | mysql -uroot`

2. If you get an error about missing db fields, try migrating your test database:
`RAILS_ENV=test rake db:migrate`

## Linux
### SyntheticEvent.augmentClass is not a function
```
PhantomJS 2.1.1 (Linux 0.0.0) ERROR
  TypeError: SyntheticEvent.augmentClass is not a function. (In 'SyntheticEvent.augmentClass(SyntheticCompositionEvent, CompositionEventInterface)', 'SyntheticEvent.augmentClass' is undefined)
  at webpack:///node_modules/react-dom/lib/SyntheticCompositionEvent.js:33:0 <- test/integration-tests.js:322086

```
There is an issue with PhantomJS and React when running on Linux. The current workaround is to prefix any of your test commands with `BROWSER=Chrome`. For example:
```
BROWSER=Chrome bundle exec rake test:all
```
This will tell Karma, the testing framework this project uses, to use the Google Chrome browser instead of PhantomJS. *Note* you need to install Google Chrome for this to work. If you would prefer to use Chromium, you can use the prefix `BROWSER=Chrome CHROME_BIN=$(which chromium-browser)` instead.

You can also instead prepend the test command with `BROWSER=ChromeHeadless` to run the tests in a headless chrome browser, rather than having your machine open a google chrome window to run the tests in.
