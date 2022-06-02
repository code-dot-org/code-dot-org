source 'https://rubygems.org'
ruby '~> 2.5'

# Force HTTPS for github-source gems.
# This is a temporary workaround - remove when bundler version is >=2.0
# @see https://github.com/bundler/bundler/issues/4978
git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?("/")
  "https://github.com/#{repo_name}.git"
end

gem 'rails', '6.0.4.1'
gem 'rails-controller-testing', '~> 1.0.5'

# Compile Sprockets assets concurrently in `assets:precompile`.
# Ref: https://github.com/rails/sprockets/pull/470
gem 'sprockets', github: 'wjordan/sprockets', ref: 'concurrent_asset_bundle_3.x'
gem 'sprockets-rails'

# provide `respond_to` methods
# (see: http://guides.rubyonrails.org/4_2_release_notes.html#respond-with-class-level-respond-to)
gem 'responders', '~> 3.0'

# Pinning sinatra to 2.0.2, since '~> 2.0.2' actually lands us on 2.0.5, which
# breaks some firebase URIs. See
# https://github.com/code-dot-org/code-dot-org/pull/31614
gem 'sinatra', '2.0.2', require: 'sinatra/base'

gem 'mysql2', '>= 0.4.1'

gem 'dalli' # memcached
gem 'dalli-elasticache' # ElastiCache Auto Discovery memcached nodes
gem 'google_drive'
gem 'jumphash'
gem 'le', '~> 2.2'
gem 'os'
gem 'parallel'
gem 'redis', '~> 3.3.3'
# Using commit ref on fork until maintainer publishes a new version.
gem 'redis-slave-read', require: false, github: 'code-dot-org/redis-slave-read', ref: 'cfe1bd0f5cf65eee5b52560139cab133f22cb880'
gem 'xxhash'

gem 'google-api-client', '~> 0.23'

# CSRF protection for Sinatra.
gem 'rack_csrf'

# Allow profiling in all environments (including production). It will only be enabled when
# CDO.rack_mini_profiler_enabled is set. See dashboard/config/initializers/mini_profiler.rb
gem 'memory_profiler'
gem 'rack-mini-profiler'

group :development do
  gem 'annotate', '~> 3.1.1'
  gem 'aws-google' # use Google Accounts for AWS access
  gem 'web-console'
end

# Rack::Cache middleware used in development/test;
# Rack::Cache::Response used by Rack::Optimize in non-development environments.
gem 'rack-cache'

group :development, :test do
  gem 'rerun'

  # Ref: https://github.com/e2/ruby_dep/issues/24
  # https://github.com/e2/ruby_dep/issues/25
  # https://github.com/e2/ruby_dep/issues/30
  gem 'ruby_dep', '~> 1.3.1'

  gem 'shotgun'
  gem 'thin'
  # Use debugger
  #gem 'debugger' unless ENV['RM_INFO']

  gem 'active_record_query_trace'
  gem 'benchmark-ips'
  gem 'better_errors'
  gem 'binding_of_caller'
  gem 'brakeman'
  gem 'haml-rails' # haml (instead of erb) generators
  gem 'ruby-prof'
  gem 'vcr', require: false
  # For unit testing.
  gem 'webmock', '~> 3.8', require: false

  gem 'fakeredis', require: false
  gem 'mocha', require: false
  gem 'sqlite3'
  gem 'timecop'

  # For UI testing.
  gem 'cucumber'
  gem 'eyes_selenium', '3.18.4'
  gem 'minitest', '~> 5.5'
  gem 'minitest-around'
  gem 'minitest-reporters', '~> 1.2.0.beta3'
  gem 'net-http-persistent'
  gem 'rinku'
  gem 'rspec'
  gem 'selenium-webdriver', '3.141.0'
  gem 'spring'
  gem 'spring-commands-testunit'
  gem 'webdrivers', '~> 3.0'

  # For pegasus PDF generation / merging testing.
  gem 'parallel_tests'
  gem 'pdf-reader', require: false
end

# Needed for unit testing, and also for /rails/mailers email previews.
gem 'factory_girl_rails', group: [:development, :staging, :test, :adhoc]

# For pegasus PDF generation.
gem 'open_uri_redirections', require: false

# Ref: https://github.com/tmm1/gctools/pull/17
gem 'gctools', github: 'wjordan/gctools', ref: 'ruby-2.5'
# Optimizes copy-on-write memory usage with GC before web-application fork.
gem 'nakayoshi_fork'
# Ref: https://github.com/puma/puma/pull/1646
gem 'puma', github: 'wjordan/puma', branch: 'debugging'
gem 'puma_worker_killer'
gem 'unicorn', '~> 5.1.0'

gem 'chronic', '~> 0.10.2'

gem 'sass-rails', '~> 6.0.0'
# Temporarily use our own fork of sassc-rails (a dependency of sass-rails),
# while we try to get some bugs fixed upstream.
# See https://github.com/sass/sassc-rails/pull/153 for context.
gem 'sassc-rails', github: 'code-dot-org/sassc-rails', ref: 'frozen-array-fix'

# Use Uglifier as compressor for JavaScript assets.
gem 'uglifier', '>= 1.3.0'

# Use jquery as the JavaScript library.
gem 'jquery-rails'

gem 'phantomjs', '~> 1.9.7.1'

# For emoji in utility output.
gem 'gemoji'

# Authentication and permissions.
gem 'cancancan', '~> 3.0.0'
gem 'devise', '~> 4.7.0'
gem 'devise_invitable', '~> 1.6.0'

# Ref: https://github.com/instructure/ims-lti/pull/90
gem 'ims-lti', github: 'wjordan/ims-lti', ref: 'oauth_051'
# Ref: https://github.com/Clever/omniauth-clever/pull/7
gem 'omniauth-clever', '~> 1.2.1', github: 'Clever/omniauth-clever'
gem 'omniauth-facebook', '~> 4.0.0'
gem 'omniauth-google-oauth2', '~> 0.6.0'
gem 'omniauth-microsoft_v2_auth', github: 'dooly-ai/omniauth-microsoft_v2_auth'
# Ref: https://github.com/joel/omniauth-windowslive/pull/16
# Ref: https://github.com/joel/omniauth-windowslive/pull/17
gem 'omniauth-windowslive', '~> 0.0.11', github: 'wjordan/omniauth-windowslive', ref: 'cdo'

# Resolve CVE 2015 9284
# see: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2015-9284
gem 'omniauth-rails_csrf_protection', '~> 0.1'

gem 'bootstrap-sass', '~> 2.3.2.2'

gem 'haml', '~> 5.2.0'

gem 'jquery-ui-rails', '~> 6.0.1'

gem 'nokogiri', '>= 1.10.0'

gem 'highline', '~> 1.6.21'

gem 'honeybadger' # error monitoring

gem 'newrelic_rpm', group: [:staging, :development, :production], # perf/error/etc monitoring
  # Ref:
  # https://github.com/newrelic/newrelic-ruby-agent/pull/359
  # https://github.com/newrelic/newrelic-ruby-agent/pull/372
  # https://github.com/newrelic/newrelic-ruby-agent/issues/340
  github: 'code-dot-org/newrelic-ruby-agent', ref: 'PR-359_prevent_reconnect_attempts_during_shutdowns'

gem 'redcarpet', '~> 3.3.4'

gem 'geocoder'

gem 'mini_magick', ">=4.9.4"
gem 'rmagick'

gem 'acts_as_list'

gem 'kaminari' # pagination

gem 'stringex', '~> 2.5.2' # Provides String.to_ascii

gem 'naturally' # for sorting string naturally

gem 'retryable' # retry code blocks when they throw exceptions

# Used by `uglifier` to minify JS assets in the Asset Pipeline.
gem 'execjs'
# JavaScript runtime used by ExecJS.
gem 'mini_racer'

gem 'jwt' # single signon for zendesk

gem 'twilio-ruby' # SMS API for send-to-phone feature

# NOTE: apps/src/applab/Exporter.js depends on the specific names of the font
# files included here. If you're upgrading to a different version, make sure to
# check that the filenames have not changed, and copy the latest files from the
# gem into our project. These font files are currently served from:
# - /dashboard/public/fonts/
# - /pegasus/sites.v3/code.org/public/fonts/
# - /pegasus/sites.v3/hourofcode/public/fonts/
gem 'font-awesome-rails', '~> 4.7.0.5'

gem 'sequel'
gem 'user_agent_parser'

gem 'paranoia', '~> 2.4.2'
gem 'petit', github: 'code-dot-org/petit'  # For URL shortening

# JSON model serializer for REST APIs.
gem 'active_model_serializers', '~> 0.10.10'

# AWS SDK and associated service APIs.
gem 'aws-sdk-acm'
gem 'aws-sdk-cloudformation'
gem 'aws-sdk-cloudfront'
gem 'aws-sdk-cloudwatch'
gem 'aws-sdk-cloudwatchlogs'
gem 'aws-sdk-core'
gem 'aws-sdk-databasemigrationservice'
gem 'aws-sdk-dynamodb'
gem 'aws-sdk-ec2'
gem 'aws-sdk-firehose'
gem 'aws-sdk-glue'
gem 'aws-sdk-rds'
gem 'aws-sdk-route53'
gem 'aws-sdk-s3'
gem 'aws-sdk-secretsmanager'

# Lint tools
group :development, :staging, :levelbuilder do
  gem 'haml_lint', require: false
  gem 'rubocop', '1.28', require: false
  gem 'rubocop-performance', require: false
  gem 'rubocop-rails', require: false
  gem 'scss_lint', require: false
end

# Reduce volume of production logs
# Ref: https://github.com/roidrage/lograge/pull/252
gem 'lograge', github: 'wjordan/lograge', ref: 'debug_exceptions'

# Enforce SSL
gem 'rack-ssl-enforcer'

# PubSub for NetSim
gem 'pusher', '~> 1.3.1', require: false

gem 'youtube-dl.rb', group: [:development, :staging, :levelbuilder]

gem 'daemons'
gem 'httparty'
gem 'net-scp'
gem 'net-ssh'
gem 'oj'

gem 'rest-client', '~> 2.0.1'

# A rest-client dependency
# This is the latest version that's installing successfully
gem 'unf_ext', '0.0.7.2'

# Generate SSL certificates.
gem 'acmesmith', '~> 2.3.1'

gem 'addressable'
# bcrypt version specified due to "Invalid Hash" error in Linux
gem 'bcrypt', '3.1.13'
gem 'firebase'
gem 'firebase_token_generator'
gem 'sshkit'
gem 'validates_email_format_of'

gem 'composite_primary_keys', '~> 12.0'

# GitHub API; used by the DotD script to automatically create new
# releases on deploy
gem 'octokit'

# Used to create a prefix trie of student names within a section
gem 'full-name-splitter', github: 'pahanix/full-name-splitter'
gem 'rambling-trie'

gem 'omniauth-openid'
gem 'omniauth-openid-connect', github: 'wjordan/omniauth-openid-connect', ref: 'cdo'

# Ref: https://github.com/toy/image_optim/pull/145
# Also include sRGB color profile conversion.
gem 'image_optim', github: 'wjordan/image_optim', ref: 'cdo'
# Image-optimization tools and binaries.
gem 'image_optim_pack', '~> 0.5.0', github: 'wjordan/image_optim_pack', ref: 'guetzli'
# Ref: https://github.com/toy/image_optim_rails/pull/3
gem 'image_optim_rails', github: 'wjordan/image_optim_rails', ref: 'rails_root_config_path'

gem 'image_size', require: false

# Auto strip model attributes before validation (opt in)
gem 'auto_strip_attributes', '~> 2.1'

# Used to sort UTF8 strings properly
gem 'sort_alphabetical', github: 'grosser/sort_alphabetical'

gem 'StreetAddress', require: "street_address"

gem 'recaptcha', require: 'recaptcha/rails'

gem 'loofah', ' ~> 2.2.1'

# Install pg gem only on specific production hosts and the i18n-dev server.
require_pg = -> do
  require 'socket'
  %w[production-daemon production-console i18n-dev].include?(Socket.gethostname)
end

install_if require_pg do
  gem 'pg', require: false
end

gem 'activerecord-import'
gem 'active_record_union'
gem 'scenic'
gem 'scenic-mysql_adapter'

gem 'colorize'

gem 'gnista', github: 'wjordan/gnista', ref: 'embed', submodules: true
gem 'hammerspace'

gem 'require_all', require: false

gem 'dotiw'

gem 'datapackage'

gem 'ruby-progressbar'

gem 'pry'

# Google's Compact Language Detector
gem 'cld'

gem 'crowdin-api', '~> 1.2.1'
