# cdo-ruby

Installs/upgrades Ruby and associated tools.

## Usage

Include `recipe[cdo-ruby]` in a role/environment/node run-list and Ruby will be installed, as will bundler, rake, and rubygems.

This cookbook uses [`ruby-build`](https://github.com/rbenv/ruby-build#readme) internally to install Ruby.

## Attributes

- `node['cdo-ruby']['version']`: Ruby version. See `ruby-build --definitions` for available options
- `node['cdo-ruby']['rubygems_version']`: Updates the version of [RubyGems](https://rubygems.org/) installed.
- `node['cdo-ruby']['bundler_version']`: Updates the version of [Bundler](http://bundler.io/) installed.
- `node['cdo-ruby']['rake_version']`: Updates the version of [Rake](https://ruby.github.io/rake/) installed.
