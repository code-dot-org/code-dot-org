# cdo-ruby

Installs/upgrades Ruby.

## Usage

Include `recipe[cdo-ruby]` in a role/environment/node run-list and Ruby will be installed.

This cookbook uses the default `ruby-2.0` package for version 2.0,
and the [Brightbox Ubuntu PPA](https://www.brightbox.com/docs/ruby/ubuntu/) for all other versions.

## Attributes

- `node['cdo-ruby']['version']`: Ruby version.
When set to `'2.0'` (the current default), the existing Ruby 2.0 installation will continue to be used.
If `version` is greater than `'2.0'`, the old manually-installed Ruby 2.0 package will be uninstalled and cleaned up
(if present), and the new Ruby version will be installed from the [Brightbox Ubuntu PPA](https://www.brightbox.com/docs/ruby/ubuntu/).
- `node['cdo-ruby']['bundler_version']`: Updates the version of [Bundler](http://bundler.io/) installed.
- `node['cdo-ruby']['rubygems_version']`: Updates the version of [RubyGems](https://rubygems.org/) installed.
(This attribute will only apply to Ruby > `'2.0'`. The 2.0 recipe does not enforce any RubyGems version constraint.
