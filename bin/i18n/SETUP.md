# I18n Sync Setup

These scripts all require [the Crowdin CLI tool][1] version 2.0.17. Follow the
instructions there to install for your system.

You will additionally need to add a `codeorg_credentials.yml` file to this
directory (`{project root}/bin/i18n/`) containing the API key for the code.org
project, and an `hourofcode_credentials.yml` file containing the API key for the
Hour of Code project.  See [the crowdin documentation][2] for more details; the
API keys themselves can be found on the project settings page

[1]: https://support.crowdin.com/cli-tool/
[2]: https://support.crowdin.com/configuration-file/#split-project-configuration-and-api-credentials
