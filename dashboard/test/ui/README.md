# Dashboard UI Tests

Automated UI tests for the dashboard.

## Setup

### On your machine: Chrome webdriver

This is the best option for rapid iteration while writing a new test. ChromeDriver will run your tests in a new window on your machine.

1. `cd` to the directory of this README.
2. if this is your first time running tests via chromedriver, run `bundle install` and then `rbenv rehash`
3. `./runner.rb -l`

- `-l` makes it use the chromedriver, and specifies local dashboard and pegasus domains
- By default, the tests run in "headless" mode, meaning with no visible chrome window.
- **If you need to see what's happening,** add the `--headed` flag. A chrome window will pop up in the background in which you can watch the tests happen

4. In a separate window, run `tail -f *.log` from the `log` subdirectory to watch the results of your tests

- `-f` streams the log in your shell, so it will be updated as new lines are written

5. To run a single ui test, you can simply run `rake test:ui feature=path/to/test.feature`

If you get the error `unknown error: cannot get automation extension`, follow the [chromedriver-helper instructions](https://github.com/flavorjones/chromedriver-helper#updating-to-latest-chromedriver) to upgrade to latest chromedriver.

### With remote browsers: Sauce Labs

Running tests remotely on [Sauce Labs](https://saucelabs.com) lets you review results, view visual logs of test runs and even watch live video of your tests running on different browsers in real-time.

#### Installing Sauce Connect Proxy

If you want to run tests on Sauce Labs against localhost you need to run the sauce connect proxy. This
creates a tunnel which allows sauce labs to access your localhost server.

1. Follow [installation directions](https://docs.saucelabs.com/secure-connections/sauce-connect-5/installation/) for sauce connect proxy. `sc --version` should be >= 5.2

2. Setup saucelabs credentials in locals.yml:
```
# code-dot-org/locals.yml
saucelabs_username: 'yourusername'
# see https://app.saucelabs.com/user-settings under the "Access Key" header:
saucelabs_authkey: 'xxxxxx-xxxx-xxxx-xxx-xxxxxxxxx'
# can be anything, if you use multiple machines (e.g. EC2), should be unique to each:
saucelabs_tunnel_name: cdo-tunnel
```

## Running UI Tests with Sauce Labs

1. Start the sauce connect proxy:
```
bin/sauce_connect
```
2. Run your UI test
```
./runner.rb -l -c Chrome --html -f features/platform/policy_compliance.feature
```

- Log output can be found in `log/*.html`
- You can watch your tests run on the [Sauce Labs dashboard](https://saucelabs.com/beta/dashboard/tests)

## Options

Here are some example command line options. Run `./runner.rb --help` for a full list.

Run all UI tests on all browsers against your local host (by default, tests point to test.code.org). Takes some around 45 minutes to run depending on your setup. If you are testing browsers against your localhost other than Chrome, you need to setup SauceConnect - instructions are here https://wiki.saucelabs.com/display/DOCS/Setting+Up+Sauce+Connect.

`./runner.rb -d studio.code.org.localhost:3000`
Alternatively, `./runner.rb -d studio.code.org.localhost:3000 -n <some number>` will run "some number" of tests in parallel - it might be faster though too high a number will overwhelm your host. 5 seems to work well.

Run all UI tests using the local chromedriver against your localhost. Faster than running through Saucelabs.

`./runner.rb -l`

Run all UI tests for a given browser

`./runner.rb --config Chrome`

Run all tests in a given feature file for all browser/os combinations

`./runner.rb --feature features/awesome_stuff.feature`

Run exactly one UI test in a given feature file for all browser/os combinations

`./runner.rb --feature features/awesome_stuff.feature:40` will run the feature on line 40

Run one feature using chromedriver against your local machine with html output

`./runner.rb -l -f features/big_game_remix.feature --html`

Run one feature in one saucelabs browser against your local machine with html output (requires SauceConnect, described earlier)

`./runner.rb -l -f features/big_game_remix.feature -c Chrome --html`

Run **eyes tests** on one feature in one saucelabs browser against your local machine with html output (requires SauceConnect and api_key for eyes testing described in See Also below)

`./runner.rb -l -f features/angle_helper.feature -c Chrome --html --eyes`

## Tips

- If you're new to [Cucumber](https://cucumber.io), read about [Cucumber scenarios](https://cucumber.io/docs/guides/overview/), especially the keywords [Given When Then](https://cucumber.io/docs/gherkin/reference/).
- When debugging test scripts, it can be helpful to add pauses, such as: `And I wait for 5 seconds`.
- If you're missing data locally, try running `bundle exec rake seed:ui_test` from the dashboard directory

## See Also

- [Adding an Eyes Test](../../../docs/testing-with-applitools-eyes.md)
- [General Testing Instructions](../../../TESTING.md)
