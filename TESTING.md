# Testing

We use automated tests to maintain quality in our codebase. Here's an overview of the kinds of tests we use, and how to run them.

## Kinds of tests
* Apps directory
  * Unit Tests - Used to test client-side functionality of some of our levels, applab, and applab controls
  * Integration Tests - Used to test level solutions and some block behaviors
* Dashboard directory
  * Ruby tests - All of the server side business logic testing is through here.
  * UI tests - Used to test overall functionality. Intended to run across browsers. Runs either on Saucelabs or with a local Chromedriver
    * Eyes tests - Subset of UI tests intended to test the precise layout of controls on certain UI pages. Eyes tests are run through Applitools and work by comparing an expected screenshot to an actual screenshot of a certain page. Eyes tests only run on Chrome for now. If you make a change that affects layout, you will likely break eyes tests. Work with whoever is reviewing your PR to figure out if the layout change should be accepted, and the baseline will be adjusted.
 * Shared directory
   * Ruby tests - Unit tests over Ruby code in the shared directory.
* Pegasus directory
  * Ruby tests - Test server side logic, caching, graphics, etc.

### When tests are run

<!---- Can use http://markdowntable.com/ for reformatting help --->

|                        | ruby lint                 | scss lint                         | haml lint          | JavaScript eslint (everywhere) | apps test          | dashboard unit tests | UI tests (Chrome)  | UI tests (all browsers) | eyes UI tests      | pegasus unit tests | shared unit tests  |
|------------------------|---------------------------|-----------------------------------|--------------------|--------------------------------|--------------------|----------------------|--------------------|-------------------------|--------------------|--------------------|--------------------|
| pre-commit hook        | changed `*.rb and #!ruby` | changed `dashboard/app/**/*.scss` | changed `*.haml`   | changed `*.js`                 |                    |                      |                    |                         |                    |                    |                    |
| circle CI (via github) |                           |                                   |                    | :white_check_mark:             | :white_check_mark: | :white_check_mark:   | :white_check_mark: |                         |                    | :white_check_mark: | :white_check_mark: |
| staging build          | :white_check_mark:        |                                   | :white_check_mark: |                                | :white_check_mark: |                      |                    |                         |                    |                    |                    |
| test build             |                           |                                   |                    |                                |                    | :white_check_mark:   | :white_check_mark: | :white_check_mark:      | :white_check_mark: | :white_check_mark: | :white_check_mark: |

## Running tests

### Using CircleCI

By default, commits on branches will be tested using CircleCI, which performs a full install, build, and runs tests for changed sub-projects.

Tests are run for the last commit in any given push. E.g., if you make 5 commits, push them all, only the last commit will get tested.

Controlling tests:

* CI can be skipped for a given commit by including the text `[ci skip]` in the commit message
* By default, tests are only run for sub-projects which have been changed in your given branch. You can force-run all tests for a given commit by including the text `[test all]` in your commit message.
* UI tests are run automatically. They can be disabled for a given run by including `[skip ui]` in your commit message
* There are several other options for which tests are run on circle, which are documented here: https://github.com/code-dot-org/code-dot-org/blob/003a3e89e7eca48873827b53de8c69ab8808ec0d/lib/rake/circle.rake#L16-L51
* Tests can be re-run with the "Rebuild" button on CircleCI.
* Tests can be debugged by running "Rebuild with SSH", which enables SSH for the duration of the test and keeps it open for 30 minutes after tests are complete.

If you’d like to make an empty commit to force run tests with a flag, you can use git’s --allow-empty command: `git commit --allow-empty -m "Run all tests [test all]"`

Contributor pull requests do not build by default, but can be triggered to build by a GitHub organization team member. Note that the given PR should be scanned to ensure there is no malicious code and that no secrets would be displayed in test output.

If you have a personal email address additionally added to GitHub, you can re-set code-dot-org build notifications to go to your @code.org email address at: https://circleci.com/account/notifications

### Top-level Test Helpers

Our top-level `lib/rake/test.rake` file contains a handful of tasks that can be used to start tests for our different sub-projects. A full, up-to-date list of these can be found by running `rake --tasks | grep test:`.

Worth noting:

* `rake test:all` - runs all tests across all sub-projects
* `rake test:apps`, `rake test:pegasus`, `rake test:blockly_core` ... etc  - runs tests for specific sub-project
* `rake test:changed` - detects which sub-projects have changed in this branch, runs those tests
* `rake test:changed:apps` - runs apps tests if sub-project folder has changed

### Shared Tests
`cd shared && ruby -Itest ./test/path/to/your/test.rb` will run the specified
test file in the shared directory.

### Apps Tests
`npm test` will lint all of the apps code and run unit and integration tests. Run this from the `apps` directory. You can expect a full test run to take about 4-8 minutes.

It's also possible to run a subset of tests:

* `npm run lint`
* `npm run test:unit`
* `npm run test:integration`
* `npm run test:entry -- --entry=./test/unit/gridUtilsTest.js`

To debug tests in Chrome, prepend `BROWSER=Chrome WATCH=1` to any test command.

See [the apps readme](./apps/README.md) for more details.

### Dashboard Tests
`cd dashboard && RAILS_ENV=test bundle exec rails test` will run all of our dashboard Ruby tests. This can take about 15 minutes to run.

If you get a bunch of complaints about database, like missing tables or how some tables haven't been seeded, here are some things you can try in order from least to most drastic before running your tests again:

1. `RAILS_ENV=test bundle exec rake seed:secret_pictures seed:secret_words` to seed the missing data, or

2. `RAILS_ENV=test bundle exec rake db:reset db:test:prepare` to recreate your local dashboard test db and reseed the data.

If you just want to run a single file of tests, from the dashboard directory you can run
`bundle exec spring testunit ./path/to/your/test.rb` 
(if you get a seemingly unrelated error `Unable to autoload constant..` try running `spring stop` and trying again)
or
`RAILS_ENV=test bundle exec spring testunit ./path/to/your/test.rb`

To run a specific unit test, from the dashboard directory you can run
`bundle exec spring testunit ./path/to/your/test.rb --name your_amazing_test_name`
The test name is `test_` concatenated with the name of the test listed in the test file (convert spaces to underscores). Ex: If the test is called "testing some unit" you would use `--name test_testing_some_unit`.

You can get a local coverage report with
`COVERAGE=1 bundle exec ruby -Itest ./path/to/your/test.rb`

If you get an error about missing db fields, try migrating your test database:
`RAILS_ENV=test rake db:migrate`

### UI Tests and Eyes Tests
We have a set of integration tests, divided into "UI tests" (Selenium+Cucumber) and "Eyes tests" (Selenium+Cucumber+Applitools).  These tests live in [dashboard/test/ui](dashboard/test/ui) - for information on setting up and running these tests, see [the README in that directory](dashboard/test/ui) and our [guide to adding an eyes test](docs/testing-with-applitools-eyes.md).
Or you can just use this shortcut (after you've installed chromedriver):

`bundle exec rake test:ui feature=dashboard/test/ui/features/sometest.feature`

### Pegasus Tests
`cd pegasus && rake test` will run all of our pegasus Ruby tests. This usually takes ~20 seconds to run.

Pegasus tests depend on the `pegasus_test` database.  If you have database-related errors, you can recreate and reseed the test database with `RAILS_ENV=test rake test:reset_dependencies`.  This will take about four minutes.

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
