# Set up gems listed in the Gemfile.
ENV['BUNDLE_GEMFILE'] ||= File.expand_path('../../../Gemfile', __FILE__)

require 'bundler/setup' if File.exist?(ENV['BUNDLE_GEMFILE'])

# Bootsnap significantly decreases dashboard startup time by caching
# expensive operations, in particular require path resolution.
#
# See: https://codedotorg.atlassian.net/jira/software/c/projects/XTEAM/issues/XTEAM-396
#
# Only require if installed & only install in `:development` and `:adhoc`,
# at least initially. The benefit is greatest here, and long-running
# environments like staging/prod/testing raise concerns with clearing
# the tmp/cache folder.
require 'bootsnap/setup' if Gem.loaded_specs.key? 'bootsnap'
