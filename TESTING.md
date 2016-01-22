# Testing

We use many different kind of tests to maintain quality in our codebase. Here's an overview of what these tests are, and how to run them.

## Kinds of tests
* Apps directory
  * Mocha Tests - Used to test client-side functionality of some of our levels, applab, and applab controls
  * Konacha Tests - Subset of client-side functionality testing is here, we use this to test storage of client state.
* Dashboard directory
  * Ruby tests - All of the server side business logic testing is through here. 
  * UI tests - Used to test overall functionality. Intended to run across browsers.
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
`cd <your repo directory>/dashboard`
`rake test` 
This will run all of our Ruby tests. This can take about 15 minutes to run

If you get a bunch of complaints about database, like missing tables or how some tables haven't been seeded, you can try running `RAILS_ENV test rake db:reset db:migrate seed:all` to recreate the db.

If you just want to run a single file of tests, you can run
`bundle exec ruby -Itest ./path/to/your/test.rb`

To run a specific unit test, you can run
`bundle exec ruby -Itest ./path/to/your/test.rb --name your_amazing_test_name`

### UI Tests
Our UI tests live in dashboard/test/ui, so all commands need to be run out of there. The script 
