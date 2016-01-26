# Testing

We use automated tests to maintain quality in our codebase. Here's an overview of the kinds of tests we use, and how to run them.

## Kinds of tests
* Apps directory
  * Mocha Tests - Used to test client-side functionality of some of our levels, applab, and applab controls
  * Konacha Tests - Subset of client-side functionality testing is here, we use this to test storage of client state.
* Dashboard directory
  * Ruby tests - All of the server side business logic testing is through here. 
  * UI tests - Used to test overall functionality. Intended to run across browsers. Runs either on Saucelabs or with a local Chromedriver
    * Eyes tests - Subset of UI tests intended to test the precise layout of controls on certain UI pages. Eyes tests are run through Applitools and work by comparing an expected screenshot to an actual screenshot of a certain page. Eyes tests only run on Chrome for now. If you make a change that affects layout, you will likely break eyes tests. Work with whoever is reviewing your PR to figure out if the layout change should be accepted, and the baseline will be adjusted.

## Running tests

### Mocha Tests
`grunt exec:mocha test` will run all mocha tests. Run this from the `apps` directory

To run a subset of tests, you can run 
`grunt exec:mochaTest --grep "Interesting Test Name"` - Run all tests with a given string in the description
`grunt exec:mocahTest --grep filename` - Run all tests in a given filename. Filename doesn't have to be the full path to the file, just the filename is sufficient
You can append `--fast` if you don't want to test turtle/maze levels and want the tests to go faster

You can expect a full test run to take about 5-10 minutes.

### Konacha Tests

`bundle exec rake konacha:server` will run konacha tests. Run this from the `dashboard` directory, then visit the URL it provides to see your test results.

Tests run pretty quickly

### Dashboard Tests
`cd dashboard`
`rake test` 
This will run all of our Ruby tests. This can take about 15 minutes to run

If you get a bunch of complaints about database, like missing tables or how some tables haven't been seeded, you can try running `RAILS_ENV test rake db:reset db:migrate seed:all` to recreate the db.

If you just want to run a single file of tests, you can run
`bundle exec ruby -Itest ./path/to/your/test.rb`

To run a specific unit test, you can run
`bundle exec ruby -Itest ./path/to/your/test.rb --name your_amazing_test_name`

### UI Tests
Our UI tests live in dashboard/test/ui, so all commands need to be run out of there. The script `runner.rb` is responsible for actually running tests and accepts many parameters. For a full list, run `runner.rb -h`

Sample Commands

Run all UI tests on all browsers against your local host (by default, tests point to staging.code.org). Takes some around 45 minutes to run depending on your setup. If you are testing browsers against your localhost other than Chrome, you need to setup SauceConnect - instructions are here https://wiki.saucelabs.com/display/DOCS/Setting+Up+Sauce+Connect.

`./runner.rb -d localhost.studio.code.org:3000`
Alternatively, `./runner.rb -d localhost.studio.code.org:3000 -p <some number>` will run "some number" of tests in parallel - it might be faster though too high a number will overwhelm your host. 5 seems to work well.

Run all UI tests using the local chromedriver against your localhost. Faster than running through Saucelabs.
`./runner.rb -l`

Run all UI tests for a given browser/os combination - full list of combinations is in browsers.json
`./runner.rb --config ChromeLatestWin7`

Run all UI tests for a given browser
`./runner.rb --browser Chrome`

Run all tests in a given feature file for all browser/os combinations
`./runner.rb --feature features/awesomeStuff.feature`

Run exactly one UI test in a given feature file for all browser/os combinations
`./runner.rb --feature features/awesomeStuff.feature:40` will run the feature on line 40

Run the eyes tests (see top section for more information on Eyes)
`./runner.rb --eyes`

###Dealing with test failures (non-Eyes)
Our tests are pretty reliable, but not entirely reliable. If you see a test failure, you should investigate it and not immediately assume it is spurious.

Take a look at the Saucelabs replay. You can view a list of recently run tests on Saucelabs and find your error - alternatively, you can run tests with the --html or --verbose option and see a URL. Saucelabs should have a video replay of what the test looked like. If you see something like a certificate error (common when testing on localhost) or a complete CSS breakdown (sometimes specific to IE9) then this is probably because of a flakey test and its safe to ignore. Most other failures do need to be addressed.

###Dealing with test failures (eyes)
If you've made a change that caused an eyes failiure, log into Applitools and check out the replay. You can see highlighted areas indicating what parts are different. If you've done something that changes the layout, images, or text, that may cause an eyes failure. Confirm with another team member that this is okay, and you can accept the new appearance as the baseline for future tests.
