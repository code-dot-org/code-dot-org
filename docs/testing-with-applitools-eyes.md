# Writing UI tests with Applitools Eyes

Applitools Eyes is a service that lets us upload and compare screenshots of our site over time.

## Getting an account

Code.org employees as of this writing should receive login details for a shared account. If not, contact Anthony about getting an account.

## Add your feature to the eyes file

Either add your test to `/dashboard/test/ui/features/eyes.feature`

OR

add your test to a new `.feature` file, annotating it with `@eyes`

If you need to write an eyes test that is specific to a mobile device, make sure
it is annotated with `@eyes_mobile` and not `@eyes`.  By default, `@eyes` tests
will only run against Chrome 33 and `@eyes_mobile` tests will only run against
iPhone.

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

1. `bundle exec ./runner.rb --eyes -c Chrome33Win7,iPhone`

## Watch for run on CircleCI and test server deploy

Both on CircleCI In `aws/build.rake`, as part of the test.code.org CI script, the eyes tests will be run (as of writing, currently only against the Chrome 33 browser and iPhone).

Results will show up in the Selenium HTML output when changes occur. You can navigate to the reported URL from there to accept the new baseline.
 
## CircleCI branch and merge handling

Each time an Eyes UI test is run, it is run with branch set to that branch, and parent_branch set to either the target of a PR with that branch or the default base branch for that given branch (`test` -> `production`, `staging` -> `test`, `[feature branches, etc.]` -> `staging`).

Per [Applitools' documentation, we use the copybranch API endpoint](http://support.applitools.com/customer/en/portal/articles/2142886-using-multiple-branches-) to merge baselines when a merge commit is detected on a given branch.

## See Also

* [UI Testing Instructions](../dashboard/test/ui/README.md)
* [General Testing Instructions](../TESTING.md)
