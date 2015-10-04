# Dashboard UI Tests

Automated UI tests for the dashboard.

## Setup

### On your machine: Chrome webdriver

This is the best option for rapid iteration while writing a new test. ChromeDriver will run your tests in a new window on your machine.

1. [Download the chromedriver](https://code.google.com/p/selenium/wiki/ChromeDriver)
2. Start the chromedriver in the background (or a separate window): `/path/to/your/downloaded/chromedriver &`
3. `cd` to the directory of this README.
4. `bundle install`
5. `rbenv rehash`
6. `./runner.rb -l -m -d localhost.studio.code.org:3000 -p localhost.code.org:3000`
  - `-l` makes it use the chromedriver
  - `-m` maximizes the window on startup
  - `-d` sets the test domain for dashboard
  - `-p` sets the test domain for pegasus
  - a window will pop up in the background in which you can watch the tests happen
7. In a separate window, run `tail -f *.log` to watch the results of your tests
  - `-f` streams the log in your shell, so it will be updated as new lines are written

### With remote browsers: Saucelabs

Running tests remotely on [Saucelabs](https://saucelabs.com) lets you review results, view visual logs of test runs and even watch live video of your tests running on different browsers in real-time.

We currently have 120 available browsers, and the automated ui tests attempt to run 110.

#### Credentials

Saucelabs requires credentials to be set in locals.yml first.

````
# code-dot-org/locals.yml
saucelabs_username: 'yourusername'
saucelabs_authkey: 'xxxxxx-xxxx-xxxx-xxx-xxxxxxxxx'

````

You can find the values for these settings in your saucelabs account.  It says "welcome, [username]" up top, and the access key is at the bottom of the grey box on the left.

#### Saucelabs tunnel

If you want to run tests on saucelabs against localhost you need to set up your tunnel:

1. Download and run the [saucelabs tunnel](https://docs.saucelabs.com/reference/sauce-connect/)
2. `~/bin/sc/ -u $SAUCELABS_USERNAME -k SAUCELABS_ACCESS_KEY` (the above documentation link has a example command line with your credentials that you can copy)
3. `./runner.rb -d localhost-studio.code.org:3000 <whatever other arguments you want>`

You can now watch your tests run at the [saucelabs dashboard](https://saucelabs.com/beta/dashboard/tests)

## Options

Here are some example command line options.  Run `./runner.rb --help` for a full list.

Run with a specific OS version, browser, browser version, and feature:

```
./runner.rb -c IE9Win7 -f features/simpledrag.feature
```

Run with a specific domain substituted in place of the default

```
./runner.rb -d localhost-studio.code.org:3000
```

see "Saucelabs tunnel" section above for how to set up the tunnel

Run against local Chrome webdriver instead of saucelabs:

```
./runner.rb -l
```

Note that this requires a local webdriver running on port 9515, such as Chromedriver at http://chromedriver.storage.googleapis.com/index.html.

## Tips

- If you're new to [Cucumber](http://cukes.info/), read about [Cucumber scenarios](https://github.com/cucumber/cucumber/wiki/Feature-Introduction), especially the keywords [Given When Then](https://github.com/cucumber/cucumber/wiki/Given-When-Then).
- When debugging test scripts, it can be helpful to add pauses, such as: `And I wait for 5 seconds`.
