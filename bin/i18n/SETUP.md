# I18n Sync Setup

These scripts all require [the Crowdin CLI tool][1] version 3.7.2. Follow the
instructions there to install for your system.

These scripts also require some dependencies to be installed using NPM. Run the
following command while in this directory
```
npm install
```

You will additionally need to add a `crowdin_credentials.yml` file to this
directory (`{project root}/bin/i18n/`) containing the personal API token for the code.org
Crowdin account. You should create a personal token labeled with your name. See [the crowdin documentation][2]
for more details; th

[1]: https://support.crowdin.com/cli-tool/
[2]: https://crowdin.com/settings#api-key 
