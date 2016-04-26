# chef_handler cookbook CHANGELOG
This file is used to list changes made in each version of the chef_handler cookbook.

## v1.3.0 (2016-02-16)
- Added state attributes to the custom resource
- Added source_url and issues_url to metadata.rb
- Replaced attributes for root user and group with the Ohai defined values to simplify the logic of the cookbook
- Added lint, unit, and itegration testing in Travis CI
- Added Test Kitchen testing of the recipes and the custom resource via a test cookbook
- Added Berksfile
- Added chefignore and .gitignore files
- Added .rubocop.yml config and resolve multiple issues
- Updated contributing and testing docs to the latest
- Added all testing dependencies to the Gemfile
- Added maintainers.md and maintainers.toml files
- Expanded the Rakefile for simplified testing

## v1.2.0 (2015-06-25)
- Move to support Chef 12+ only. Removes old 'handler class reload' behavior - it isn't necessary because chef-client forks and doesn't share a process between runs.

## v1.1.9 (2015-05-26)
- Bugfixes from 1.1.8 - loading without source is not allowed again. Class unloading is performed more carefully. Tests for resource providers.

## v1.1.8 (2015-05-14)
- Updated Contribution and Readme docs
- Fix ChefSpec matchers
- Allow handler to load classes when no source is provided.

## v1.1.6 (2014-04-09)
- [COOK-4494] - Add ChefSpec matchers

## v1.1.5 (2014-02-25)
- [COOK-4117] - use the correct scope when searching the children class name

## v1.1.4
- [COOK-2146] - style updates

## v1.1.2
- [COOK-1989] - fix scope for handler local variable to the enable block

## v1.1.0
- [COOK-1645] - properly delete old handlers
- [COOK-1322] - support platforms that use 'wheel' as root group'

## v1.0.8
- [COOK-1177] - doesn't work on windows due to use of unix specific attributes

## v1.0.6
- [COOK-1069] - typo in chef_handler readme

## v1.0.4
- [COOK-654] dont try and access a class before it has been loaded
- fix bad boolean check (if vs unless)

## v1.0.2
- [COOK-620] ensure handler code is reloaded during daemonized chef runs
