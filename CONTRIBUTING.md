# Contributing

We'd love to have you join our group of contributors! Please e-mail your areas 
of interest and your availability to Alice (alice@code.org), and we’ll be happy
to match you with a project. You can start setting up with these next steps.

1. Anyone who would like to contribute to **[Code.org](https://github.com/code-dot-org/)** projects **must read and sign the [Contributor License Agreement](https://na2.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=8eb90665-c9f7-4b06-81a5-11d12020f251)**. We can't accept pull requests from contributors who haven't yet signed the CLA.

2. [Join our community development HipChat room](http://www.hipchat.com/gBebkHP6g) for help getting set up, picking a task, etc. We're happy to have you! If you want to make sure you get our attention, include an **@all** (everyone) or **@here** (everyone currently in the room) in your message.

3. Get your build setup, following this README. Fork our repo and make sure to merge our staging branch in **WEEKLY** as we do update frequently.

## Submitting Contributions
Please check your PR against our tests before submitting.

#### Code style

Running `rake lint` locally will find most Ruby warnings. For other languages see the [style guide](STYLEGUIDE.md).

#### Manually

We support recent versions of Firefox, Chrome, IE9, iOS Safari and the Android browsers ([full list of supported browsers and versions](https://support.code.org/hc/en-us/articles/202591743)). Be sure to try your feature out in IE9, iOS and Android if it's a risk. [BrowserStack live](http://www.browserstack.com) or [Sauce Labs manual](https://saucelabs.com/manual) let you run manual tests in these browsers remotely.

#### Unit tests

For dashboard changes, be sure to test your changes using `rake test`. For [apps or blockly](./apps) changes, see our [grunt testing instructions](./apps#running-tests).

#### UI tests

Our continuous integration server regularly runs a suite of [UI tests](./dashboard/test/ui) using Selenium / Cucumber which run against many browsers via [BrowserStack Automate](https://www.browserstack.com/automate), and can also be run locally using `chromedriver`. See the [README](./dashboard/test/ui) in that folder for instructions.

If your changes might affect level paths, blockly UI, or critical path site logic, be sure to test your changes with a local UI test.

### Submitting your Pull Request

Contributors should follow the GitHub [fork-and-pull model](https://help.github.com/articles/using-pull-requests) to submit pull requests into this repository.

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
    - For bonus points, include screenshots in the description. Command + Ctrl + Shift + 4 in OS X lets you copy a screen selection to your clipboard, which GitHub will let you paste right into the description
5. After your pull request is merged into staging, you can review your changes on the following sites:
  * [https://staging.code.org/](https://staging.code.org/)
  * [https://staging-studio.code.org/](https://staging-studio.studio.code.org/)
  * [https://staging.csedweek.org/](https://staging.csedweek.org/)
