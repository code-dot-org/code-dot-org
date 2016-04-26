postfix Cookbook CHANGELOG
==========================
This file is used to list changes made in each version of the postfix cookbook.

v3.7.0 (2015-04-30)
-------------------
- Adding support for relay restrictions
- Update chefspec and serverspec tests

v3.6.2 (2014-10-31)
-------------------
- Fix FreeBSDisms

v3.6.1 (2014-10-28)
-------------------
- Fix documentation around node['postfix']['main']['relayhost'] attribute
- Fix logic around include_recipe 'postfix::virtual_aliases_domains'

v3.6.0 (2014-08-25)
-------------------
- restart postfix after updating virtual alias templates #86
- fixing typo for alias_db location in omnios
- moving conditional attributes to a recipe so they can be modified
  via other cookbook attributes

v3.5.0 (2014-08-25)
-------------------
Adding virtual_domains functionality

v3.4.1 (2014-08-20)
-------------------
Removing unused parameters from main.cf

v3.4.0 (2014-07-25)
-------------------
Refactoring to fix some logic issues

v3.3.1 (2014-06-11)
-------------------
Reverting #37 - [COOK-3418] Virtual Domain Support PR - duplicate of #55


v3.3.0 (2014-06-11)
-------------------
- #37 - [COOK-3418] - Virtual Domain Support
- #44 - Fix minor formatting issue in attributes
- #55 - Add support for virtual aliases
- #57 - Fixing attributes bug in README
- #64 - add smtp_generic maps configuration option
- #66 - [COOK-3652] Add support for transport mappings
- #67 - [COOK-4662] Added support for access control
- #68 - Properly handle binding to loopback on mixed IPV4/IPV6 systems


v3.2.0 (2014-05-09)
-------------------
- [COOK-4619] - no way to unset recipient_delimiter


v3.1.8 (2014-03-27)
-------------------
- [COOK-4410] - Fix sender_canonical configuration by adding template
  and postmap execution


v3.1.6 (2014-03-19)
-------------------
- [COOK-4423] - use platform_family, find cert.pem on rhel


v3.1.4 (2014-02-27)
-------------------
[COOK-4329] Migrate minitest PITs to latest test-kitchen + serverspec


v3.1.2 (2014-02-19)
-------------------
### Bug
- **[COOK-4357](https://tickets.chef.io/browse/COOK-4357)** - postfix::sasl_auth recipe fails to converge


v3.1.0 (2014-02-19)
-------------------
### Bug
- **[COOK-4322](https://tickets.chef.io/browse/COOK-4322)** - Postfix cookbook has incorrect default path for sasl_passwd

### New Feature
- **[COOK-4086](https://tickets.chef.io/browse/COOK-4086)** - use conf_dir attribute for sasl recipe, and add omnios support
- **[COOK-2551](https://tickets.chef.io/browse/COOK-2551)** - Support creating the sender_canonical map file


v3.0.4
------
### Bug
- **[COOK-3824](https://tickets.chef.io/browse/COOK-3824)** - main.cf.erb mishandles lists

### Improvement
- **[COOK-3822](https://tickets.chef.io/browse/COOK-3822)** - postfix cookbook readme has an incorrect example
- Got rubocop errors down to 32

### New Feature
- **[COOK-2551](https://tickets.chef.io/browse/COOK-2551)** - Support creating the sender_canonical map file


v3.0.2
------
### Bug
- **[COOK-3617](https://tickets.chef.io/browse/COOK-3617)** - Fix error when no there is no FQDN
- **[COOK-3530](https://tickets.chef.io/browse/COOK-3530)** - Update `client.rb` after 3.0.0 refactor
- **[COOK-2499](https://tickets.chef.io/browse/COOK-2499)** - Do not use resource cloning

### Improvement
- **[COOK-3116](https://tickets.chef.io/browse/COOK-3116)** - Add SmartOS support


v3.0.0
------
### Improvement
- **[COOK-3328](https://tickets.chef.io/browse/COOK-3328)** - Postfix main/master and attributes refactor

**Breaking changes**:
- Attributes are namespaced as `node['postfix']`, `node['postfix']['main']`, and `node['postfix']['master']`.

v2.1.6
------
### Bug
- [COOK-2501]: Reference to `['postfix']['domain']` should be `['postfix']['mydomain']`
- [COOK-2715]: master.cf uses old name for `smtp_fallback_relay` (`fallback_relay`) parameter in master.cf

v2.1.4
------
- [COOK-2281] - postfix aliases uses require_recipe statement

v2.1.2
------
- [COOK-2010] - postfix sasl_auth does not include the sasl plain package

v2.1.0
------
- [COOK-1233] - optional configuration for canonical maps
- [COOK-1660] - allow comma separated arrays in aliases
- [COOK-1662] - allow inet_interfaces configuration via attribute

v2.0.0
------
This version uses platform_family attribute, making the cookbook incompatible with older versions of Chef/Ohai, hence the major version bump.

- [COOK-1535] - `smtpd_cache` should be in `data_directory`, not `queue_directory`
- [COOK-1790] - /etc/aliases template is only in ubuntu directory
- [COOK-1792] - add minitest-chef tests to postfix cookbook

v1.2.2
------
- [COOK-1442] - Missing ['postfix']['domain'] Attribute causes initial installation failure
- [COOK-1520] - Add support for procmail delivery
- [COOK-1528] - Make aliasses template less specific
- [COOK-1538] - Add iptables_rule template
- [COOK-1540] - Add smtpd_milters and non_smtpd_milters parameters to main.cf

v1.2.0
------
- [COOK-880] - add client/server roles for search-based discovery of relayhost

v1.0.0
------
- [COOK-668] - RHEL/CentOS/Scientific/Amazon platform support
- [COOK-733] - postfix::aliases recipe to manage /etc/aliases
- [COOK-821] - add README.md :)

v0.8.4
------
- Current public release.
