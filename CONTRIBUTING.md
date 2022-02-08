# Contributing

We'd love to have you join our group of contributors! Please e-mail your areas of interest and your availability to contributing@code.org, and we’ll be happy to match you with a project.

This project adheres to the [Contributor Covenant][code-of-conduct]. By participating, you are expected to honor this code.

[code-of-conduct]: CODE_OF_CONDUCT.md

You can start setting up with these next steps:

1. Anyone who would like to contribute to **[Code.org](https://github.com/code-dot-org/)** projects **must read and sign the [Contributor License Agreement](https://na2.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=e5fc8c52-925f-47e0-922c-90b24daa2b94&env=na2&acct=66bab3ee-40e1-40e3-ad7f-7576ba73668c&v=2)**. We can't accept pull requests from contributors who haven't yet signed the CLA.

2. Get your local development build working by following our [SETUP](SETUP.md). Fork our repo and make sure to merge our staging branch into yours **WEEKLY** as we do update frequently.

## Code Style

Please make sure your code conforms to our [style guide](STYLEGUIDE.md).  We have implemented linting to help you with this:

* To ensure our precommit linting hook is installed, run `rake install:hooks`. You should only have to do this once.
* To lint the entire project, run `rake lint` from the repository root.  This will check all Ruby, JavaScript and HAML.
* To lint only part of the project, run one of these commands from the repository root:
  * dashboard: `cd dashboard && rubocop && haml-lint`
  * pegasus Ruby: `cd pegasus && rubocop`
  * pegasus HAML: `haml-lint pegasus`
  * apps: See the [apps README](./apps#style-guide)


## Testing

Please test your changes before submitting them to us!

### Manual testing

We support recent versions of Firefox, Chrome, Internet Explorer, Edge, iOS Safari and the Android browsers ([full list of supported browsers and versions](https://support.code.org/hc/en-us/articles/202591743)). Be sure to try your feature out in [IE9](docs/testing-ie9.md), iOS and Android if it's a risk. [Sauce Labs](https://saucelabs.com/manual) lets you run manual tests in these browsers remotely.

### Unit tests

For dashboard changes, be sure to test your changes using `rake test`. For [apps or blockly](./apps) changes, see our [grunt testing instructions](./apps#running-tests).

### UI tests

Our continuous integration server regularly runs a suite of [UI tests](./dashboard/test/ui) using Selenium / Cucumber which run against many browsers via [Sauce Labs](https://saucelabs.com/), and can also be run locally using `chromedriver`. See the [README](./dashboard/test/ui) in that folder for instructions.

If your changes might affect level paths, blockly UI, or critical path site logic, be sure to test your changes with a local UI test.

## Submitting your Pull Request

Once you've linted and tested your changes, send us a pull request!  Contributors should follow the GitHub [fork-and-pull model](https://help.github.com/articles/using-pull-requests) to submit pull requests into this repository.  Code.org developers should also work on a branch and use a pull request to merge to staging; please do not merge directly to the code-dot-org/staging branch.

1. On your fork, you'll either push to your own finished branch or checkout a new branch for your feature before you start your feature
    - `git checkout -b branch_name`
2. Develop the new feature and push the changes to **your** fork and branch
    - `git add YYY`
    - `git commit -m "ZZZ"`
    - `git push origin branch_name`
3. Go to the code-dot-org GitHub page
    - [https://github.com/code-dot-org/code-dot-org](https://github.com/code-dot-org/code-dot-org)
4. For your submission to be reviewed
    - Click on the "Pull Request" link, look over and confirm your diff
    - Submit a pull request for your branch to be merged into staging
    - For bonus points, include before and after screenshots in the description. Command + Ctrl + Shift + 4 in OS X lets you copy a screen selection to your clipboard, which GitHub will let you paste right into the description
5. A Code.org [developer will ensure our test suite runs on your changes](https://github.com/code-dot-org/code-dot-org/wiki/How-to-run-Circle--tests-on-a-contributor-PR) and will merge your PR to staging for you.
6. After your pull request is merged into staging, you can review your changes on the following sites:
  * [https://staging.code.org/](https://staging.code.org/)
  * [https://staging-studio.code.org/](https://staging-studio.studio.code.org/)
  * [https://staging.csedweek.org/](https://staging.csedweek.org/)
