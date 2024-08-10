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

We currently have 120 available browsers, and the automated ui tests attempt to run 110.

#### Credentials

Sauce Labs requires credentials to be set in locals.yml first.

```
# code-dot-org/locals.yml
saucelabs_username: 'yourusername'
saucelabs_authkey: 'xxxxxx-xxxx-xxxx-xxx-xxxxxxxxx'

```

You can find the values for these settings in your saucelabs account settings (`https://app.saucelabs.com/users/:username`) The key you need, `saucelabs_authkey`, will be under the "Access Key" header.

#### Sauce Labs tunnel

If you want to run tests on Sauce Labs against localhost you need to set up your tunnel:

#### Latest version of Sauce Connect Proxy CLI (5.1.0)

1. Login to Sauce Labs and download the [tunnel](https://app.saucelabs.com/tunnels).
2. Uncomment and fill out the values for the "saucelabs\_" properties in `locals.yml`
   - `saucelabs_tunnel_name` can be an arbitrary name, but it needs to match what you pass as an argument to `sc run...`
3. (Re)start your dashboard-server `./bin/dashboard-server`.
4. Start the sauce labs tunnel
   - `sc run -u <saucelabs_username> -k <saucelabs_authkey> -r us-west --tunnel-name <saucelabs_tunnel_name>`
5. Run your UI test
   - `./runner.rb -l -c Chrome --html -f features/platform/policy_compliance.feature`
     - The log output can be found in `log/*.html`

#### Older versions of Sauce Connect Proxy CLI

1. Login to Sauce Labs and download the [tunnel](https://app.saucelabs.com/tunnels).
   - If you work on a Linux EC2 instance:
     - Download the Linux version (will end in .tar.gz)
     - Secure copy this file into your dev environment with something like `scp sc-4.7.1-linux.tar.gz ubuntu@[ip_address]:/ec2-user/environment/code-dot-org`
   - From the destination folder, unzip the file (or for EC2 instances, unzip and untar the file with `tar -xvzf sc-4.7.1-linux.tar`)
2. `cd` into the unzipped folder and start the tunnel via `bin/sc --user <saucelabs-username> --api-key <saucelabs-api-key>`. You can find your username and key on the page linked in step 1. Note: the command listed there does not match the above.
   - The `bin/sc` path only works once you've navigated into the unzipped file (on a mac, the full path might look something like `sc-4.8.2-osx/bin/sc`).
   - The configuration of the `--tunnel-name` flag (formerly [`--tunnel-id`](https://docs.saucelabs.com/dev/cli/saucectl/run/#--tunnel-name)) depends on your environment:
     - If you do _not_ work on an EC2 instance, the `--tunnel-name` flag (included in the command given by Sauce Labs), can be removed. If you leave it in, you'll also need to set the `tunnelIdentifier` option in the `sauce_capabilities` config. See [Using Sauce Connect Tunnel Identifiers](https://wiki.saucelabs.com/display/DOCS/Using+Sauce+Connect+Tunnel+Identifiers#UsingSauceConnectTunnelIdentifiers-TheBasicsofUsingTunnelIdentifiers) for more details.
     - If you _do_ work on an EC2 instance, the `--tunnel-name` flag is required to launch the tunnel.
3. (Re)start your dashboard-server `./bin/dashboard-server`.
4. In a new terminal window, navigate back into `dashboard/test/ui` and run your ui tests `./runner.rb -d studio.code.org.localhost:3000 <whatever other arguments you want>`

You can now watch your tests run at the [Sauce Labs dashboard](https://saucelabs.com/beta/dashboard/tests)

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
