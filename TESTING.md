# Testing

We use automated tests to maintain quality in our codebase. Here's an overview of the kinds of tests we use, and how to run them.

## Kinds of tests
* Apps directory
  * Mocha Tests - Used to test client-side functionality of some of our levels, applab, and applab controls
* Dashboard directory
  * Ruby tests - All of the server side business logic testing is through here. 
  * Konacha Tests - Subset of client-side functionality testing is here, we use this to test storage of client state.
  * UI tests - Used to test overall functionality. Intended to run across browsers. Runs either on Saucelabs or with a local Chromedriver
    * Eyes tests - Subset of UI tests intended to test the precise layout of controls on certain UI pages. Eyes tests are run through Applitools and work by comparing an expected screenshot to an actual screenshot of a certain page. Eyes tests only run on Chrome for now. If you make a change that affects layout, you will likely break eyes tests. Work with whoever is reviewing your PR to figure out if the layout change should be accepted, and the baseline will be adjusted.
 * Shared directory
   * Ruby tests - Unit tests over Ruby code in the shared directory.
* Pegasus directory
  * Ruby tests - Test server side logic, caching, graphics, etc.

## Running tests

### Mocha Tests
`grunt mochaTest` will run all mocha tests. Run this from the `apps` directory.

To run a subset of tests, you can run 
`grunt exec:mochaTest --grep "Interesting Test Name"` - Run all tests with a given string in the description
`grunt exec:mocahTest --grep filename` - Run all tests in a given filename. Filename doesn't have to be the full path to the file, just the filename is sufficient
You can append `--fast` if you don't want to test turtle/maze levels and want the tests to go faster

You can expect a full test run to take about 5-10 minutes.

### Konacha Tests
`cd dashboard && bundle exec rake konacha:server` will run konacha tests. Visit the URL it provides to see your test results.

Tests run pretty quickly

### Dashboard Tests
`cd dashboard && rake test` will run all of our dashboard Ruby tests. This can take about 15 minutes to run.

If you get a bunch of complaints about database, like missing tables or how some tables haven't been seeded, you can try running `RAILS_ENV=test rake db:reset db:migrate seed:all` to recreate the db.

If you just want to run a single file of tests, you can run
`bundle exec ruby -Itest ./path/to/your/test.rb`

To run a specific unit test, you can run
`bundle exec ruby -Itest ./path/to/your/test.rb --name your_amazing_test_name`

### UI Tests and Eyes Tests
We have a set of integration tests, divided into "UI tests" (Selenium+Cucumber) and "Eyes tests" (Selenium+Cucumber+Applitools).  These tests live in [dashboard/test/ui](dashboard/test/ui) - for information on setting up and running these tests, see [the README in that directory](dashboard/test/ui) and our [guide to adding an eyes test](docs/testing-with-applitools-eyes.md).

### Pegasus Tests
`cd pegasus && rake test` will run all of our pegasus Ruby tests. This usually takes ~10 seconds to run.

If you get a database complaint like missing pegasus_test table, try running `RAILS_ENV=test bundle exec rake install:pegasus`

###Dealing with test failures (non-Eyes)
Our tests are pretty reliable, but not entirely reliable. If you see a test failure, you should investigate it and not immediately assume it is spurious.

Take a look at the Saucelabs replay. You can view a list of recently run tests on Saucelabs and find your error - alternatively, you can run tests with the --html or --verbose option and see a URL. Saucelabs should have a video replay of what the test looked like. If you see something like a certificate error (common when testing on localhost) or a complete CSS breakdown (sometimes specific to IE9) then this is probably because of a flakey test and its safe to ignore. Most other failures do need to be addressed.

###Dealing with test failures (eyes)
If you've made a change that caused an eyes failiure, log into Applitools and check out the replay. You can see highlighted areas indicating what parts are different. If you've done something that changes the layout, images, or text, that may cause an eyes failure. Confirm with another team member that this is okay, and you can accept the new appearance as the baseline for future tests.

## See Also

* [Testing Production Locally](docs/testing-production-locally.md)
* [Testing IE9](docs/testing-ie9.md)
