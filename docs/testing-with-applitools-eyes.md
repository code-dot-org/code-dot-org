# Writing UI tests with Applitools Eyes

Applitools Eyes is a service that lets us upload and compare screenshots of our site over time.

## Getting an account

Consult the [Getting Started as a Developer at Code.org](https://docs.google.com/document/d/158MiIxJ_1JokzUkw43Wf2bFONPycYoCeXtKEU-ww0Xw/edit) document for details on how to gain access to Applitools Eyes.

## Add your feature to the eyes file

Either add your test to `/dashboard/test/ui/features/eyes.feature`

OR

add your test to a new `.feature` file, annotating it with `@eyes`

If you need to write an eyes test that is specific to a mobile device, make sure
it is annotated with `@eyes_mobile` and not `@eyes`. With `--eyes`, `runner.rb`
runs `@eyes` tests on desktop browsers and `@eyes_mobile` tests only on mobile
browsers (iPad, iPhone). Drone and the test server run eyes tests on Chrome
only, so `@eyes_mobile` tests run only when invoked by hand.

## Run the test

To run locally, you must have the Applitools secret key installed in your `locals.yml`.

```yaml
# code-dot-org/locals.yml
applitools_eyes_api_key: 'my_applitools_eyes_key'
```

You can find that key by [logging in](https://eyes.applitools.com/app/sessions/) and pressing (Profile Icon) -> My API Key.

### Try it locally

1. `./runner.rb -l --html --eyes -f ./path/to/your.feature` (running Chromedriver)
  1. Toggle ONLY running @eyes annotated tests with `--eyes`
  1. Usually the first test run will fail due to there being no baseline yet. In `error.log` you can see the exact error which usually includes a link to the session
  1. to see your browser run the tests, append `--headed` to the command
1. Visit the [Applitools sessions dashboard](https://eyes.applitools.com/app/sessions/) to see your test run
  1. **Accept** the changes and **Save** (bottom right)

### Try it targeting Sauce Labs

See the [UI Testing Instructions](../dashboard/test/ui/README.md) for details about running tests in Sauce Labs.

## Watch for run on CI and test server deploy

Drone runs `@eyes` tests on Chrome for each PR (`ci:run_ui_tests` in `lib/rake/ci.rake`; skip with the `[skip eyes]` commit tag). The test server runs them during deploy via the `eyes_ui` task in `lib/rake/test.rake`.

Playwright visual tests are separate: the `playwright_eyes` task in `lib/rake/test.rake` runs them on the test server, and Drone runs them as `ci:playwright_eyes`. See [frontend/packages/e2e-tests/README.md](../frontend/packages/e2e-tests/README.md).

Results will show up in the Selenium HTML output when changes occur. You can navigate to the reported URL from there to accept the new baseline.
 
## CI branch and merge handling

Each time an Eyes UI test is run, it is run with branch set to that branch, and parent_branch set to either the target of a PR with that branch or the default base branch for that given branch (`test` -> `production`, `staging` -> `test`, `[feature branches, etc.]` -> `staging`).

Per [Applitools' documentation, we use the copybranch API endpoint](http://support.applitools.com/customer/en/portal/articles/2142886-using-multiple-branches-) to merge baselines when a merge commit is detected on a given branch.

## See Also

* [UI Testing Instructions](../dashboard/test/ui/README.md)
* [General Testing Instructions](../TESTING.md)
