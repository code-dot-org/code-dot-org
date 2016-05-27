# cdo-postfix 

Installs and configures Postfix mail server using an Amazon SES account.

Wraps the official [`postfix`](https://github.com/chef-cookbooks/postfix) cookbook for the heavy lifting.

For a typical Amazon SES setup, just set `node['cdo-postfix']['username']` and `node['cdo-postfix']['password']`
attributes to the account's values, and postfix should be configured correctly.

For origins other than `code.org`, overwrite the `node['cdo-postfix']['origin']` default to the proper value.
