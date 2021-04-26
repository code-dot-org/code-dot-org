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

### With remote browsers: Saucelabs

Running tests remotely on [Saucelabs](https://saucelabs.com) lets you review results, view visual logs of test runs and even watch live video of your tests running on different browsers in real-time.

We currently have 120 available browsers, and the automated ui tests attempt to run 110.

#### Credentials

Saucelabs requires credentials to be set in locals.yml first.

```
# code-dot-org/locals.yml
saucelabs_username: 'yourusername'
saucelabs_authkey: 'xxxxxx-xxxx-xxxx-xxx-xxxxxxxxx'

```

You can find the values for these settings in your saucelabs account settings (`https://app.saucelabs.com/users/:username`) The key you need, `saucelabs_authkey`, will be under the "Access Key" header.

#### Saucelabs tunnel

If you want to run tests on saucelabs against localhost you need to set up your tunnel:

1. Login to Saucelabs and download the [tunnel](https://app.saucelabs.com/tunnels)
2. Start the tunnel via `bin/sc --user <saucelabs-username> --api-key <saucelabs-api-key>`
   - Notes: The link above has an example command line with your credentials that you can copy.
     - `bin/sc` should be replaced with the path that points to the tunnel software downloaded in step 1.
     - The unique tunnel identifier `-i <tunnel-id>` included in that command can be safely ignored; if you leave it in, you'll also need to set the `tunnelIdentifier` option in the `sauce_capabilities` config. See [Using Sauce Connect Tunnel Identifiers](https://wiki.saucelabs.com/display/DOCS/Using+Sauce+Connect+Tunnel+Identifiers#UsingSauceConnectTunnelIdentifiers-TheBasicsofUsingTunnelIdentifiers) for more details.
3. In a separate terminal window, `./runner.rb -d localhost-studio.code.org:3000 <whatever other arguments you want>`

You can now watch your tests run at the [saucelabs dashboard](https://saucelabs.com/beta/dashboard/tests)

## Options

Here are some example command line options. Run `./runner.rb --help` for a full list.

Run all UI tests on all browsers against your local host (by default, tests point to staging.code.org). Takes some around 45 minutes to run depending on your setup. If you are testing browsers against your localhost other than Chrome, you need to setup SauceConnect - instructions are here https://wiki.saucelabs.com/display/DOCS/Setting+Up+Sauce+Connect.

`./runner.rb -d localhost-studio.code.org:3000`
Alternatively, `./runner.rb -d localhost-studio.code.org:3000 -n <some number>` will run "some number" of tests in parallel - it might be faster though too high a number will overwhelm your host. 5 seems to work well.

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

Run **eyes tests** on one feature in one saucelabs browser against your local machine with html output (requires SauceConnect, described earlier)

`./runner.rb -l -f features/angle_helper.feature -c Chrome --html --eyes`

## Tips

- If you're new to [Cucumber](http://cukes.info/), read about [Cucumber scenarios](https://github.com/cucumber/cucumber/wiki/Feature-Introduction), especially the keywords [Given When Then](https://github.com/cucumber/cucumber/wiki/Given-When-Then).
- When debugging test scripts, it can be helpful to add pauses, such as: `And I wait for 5 seconds`.

## See Also

- [Adding an Eyes Test](../../../docs/testing-with-applitools-eyes.md)
- [General Testing Instructions](../../../TESTING.md)
