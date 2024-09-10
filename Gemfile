source 'https://rubygems.org'

ruby '3.0.5'

# Ruby 2.7 no longer includes some libraries by default; install
# the ones we need here
# see https://www.ruby-lang.org/en/news/2019/12/25/ruby-2-7-0-released/
gem 'thwait'

# Ruby >= 2.7.7 targets a version of CGI with over-restrictive domain
# validation; manually target a later version to pick up https://github.com/ruby/cgi/pull/29
gem 'cgi', '~> 0.3.6'

# Ruby 3.0 no longer provides sorted_set by default, so install it manually
# see https://github.com/ruby/set/pull/2
gem 'sorted_set'

# Force HTTPS for github-source gems.
# This is a temporary workaround - remove when bundler version is >=2.0
# @see https://github.com/bundler/bundler/issues/4978
git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?("/")
  "https://github.com/#{repo_name}.git"
end

gem 'rails', '~> 6.1'
gem 'rails-controller-testing', '~> 1.0.5'

# Compile Sprockets assets concurrently in `assets:precompile`.
# Ref: https://github.com/rails/sprockets/pull/470
gem 'sprockets', github: 'code-dot-org/sprockets', ref: 'concurrent_asset_bundle_3.x'
gem 'sprockets-rails', '3.3.0'

# provide `respond_to` methods
# (see: http://guides.rubyonrails.org/4_2_release_notes.html#respond-with-class-level-respond-to)
gem 'responders', '~> 3.0'

gem 'sinatra', '2.2.3', require: 'sinatra/base'

gem 'mysql2', '>= 0.4.1'

gem 'dalli' # memcached
gem 'dalli-elasticache' # ElastiCache Auto Discovery memcached nodes
gem 'google_drive'
gem 'jumphash'
gem 'os'
gem 'parallel'
gem 'redis', '~> 4.8.1'
gem 'redis-actionpack', '~> 5.4.0'
# Using commit ref on fork until maintainer publishes a new version.
gem 'redis-slave-read', require: false, github: 'code-dot-org/redis-slave-read', ref: 'cfe1bd0f5cf65eee5b52560139cab133f22cb880'
gem 'xxhash'

# Google APIs. Formerly just the `google-api-client` gem
# See https://github.com/googleapis/google-api-ruby-client/blob/main/google-api-client/OVERVIEW.md
gem 'google-apis-core'

gem 'google-apis-analytics_v3'
gem 'google-apis-classroom_v1'
gem 'google-apis-youtube_v3'

# CSRF protection for Sinatra.
gem 'rack_csrf'

# Allow profiling in all environments (including production). It will only be enabled when
# CDO.rack_mini_profiler_enabled is set. See dashboard/config/initializers/mini_profiler.rb
gem 'memory_profiler'
gem 'rack-mini-profiler'

group :development do
  gem 'annotate', '~> 3.1.1'
  gem 'aws-google', '~> 0.2.0'
  gem 'web-console', '~> 4.2.0'
  # Bootsnap pre-caches Ruby require paths + bytecode and speeds up boot time significantly.
  # We only use it in development atm to get a feel for it, and the benefit is greatest here.
  gem 'bootsnap', '>= 1.14.0', require: false
end

# Rack::Cache middleware used in development/test;
# Rack::Cache::Response used by Rack::Optimize in non-development environments.
gem 'rack-cache'

group :development, :test do
  gem 'rerun'
  gem 'thin'
  # Use debugger
  #gem 'debugger' unless ENV['RM_INFO']

  gem 'active_record_query_trace'
  gem 'benchmark-ips'
  gem 'better_errors', '>= 2.7.0'
  gem 'brakeman'
  gem 'database_cleaner-active_record', '~> 2.1.0'
  gem 'haml-rails' # haml (instead of erb) generators
  gem 'ruby-prof', '>= 1.7.0'
  gem 'vcr', require: false
  # For unit testing.
  gem 'webmock', '~> 3.8', require: false

  gem 'faker', '~> 3.4', require: false
  gem 'fakeredis', require: false
  gem 'mocha', require: false
  gem 'timecop'

  # For UI testing.
  gem 'cucumber'
  gem 'eyes_selenium', '3.18.4'
  gem 'fakefs', '~> 2.5.0', require: false
  gem 'minitest', '~> 5.15'
  gem 'minitest-around'
  gem 'minitest-rails', '~> 6.1', require: false
  gem 'minitest-reporters', '~> 1.2.0.beta3'
  gem 'minitest-spec-context', '~> 0.0.3'
  gem 'minitest-stub-const', '~> 0.6'
  gem 'net-http-persistent'
  gem 'rinku'
  gem 'rspec', require: false
  gem 'selenium-webdriver', '~> 4.0'
  gem 'simplecov', '~> 0.22.0', require: false
  gem 'spring', '~> 3.1.1'
  gem 'spring-commands-testunit'
  gem 'webdrivers', '~> 5.2'

  # For pegasus PDF generation / merging testing.
  gem 'parallel_tests'
  gem 'pdf-reader', require: false
end

# Needed for unit testing, and also for /rails/mailers email previews.
gem 'factory_bot_rails', '~> 6.2', group: [:development, :staging, :test, :adhoc]

# For pegasus PDF generation.
gem 'open_uri_redirections', require: false

# Optimizes copy-on-write memory usage with GC before web-application fork.
gem 'nakayoshi_fork'

gem 'puma', '~> 5.6'
gem 'puma_worker_killer'
gem 'raindrops'
gem 'sd_notify' # required for Puma to support systemd's Type=notify

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
gem 'cancancan', '~> 3.5.0'
gem 'devise', '~> 4.9.4'
gem 'devise_invitable', '~> 2.0.9'

gem 'omniauth-clever', '~> 2.0.1', github: 'code-dot-org/omniauth-clever', tag: 'v2.0.1'
gem 'omniauth-facebook', '~> 10.0.0'
gem 'omniauth-google-oauth2', '~> 1.1.3'
gem 'omniauth-microsoft_v2_auth', github: 'dooly-ai/omniauth-microsoft_v2_auth'

# Resolve CVE 2015 9284
# see: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2015-9284
gem 'omniauth-rails_csrf_protection', '~> 1.0'

gem 'bootstrap-sass', '~> 2.3.2.2'

gem 'haml', '~> 5.2.0'

gem 'jquery-ui-rails', '~> 6.0.1'

gem 'nokogiri', '>= 1.10.0'

gem 'highline', '~> 1.6.21'

gem 'honeybadger', '>= 4.5.6' # error monitoring

gem 'newrelic_rpm', '~> 6.14.0', group: [:staging, :development, :production] # perf/error/etc monitoring

gem 'redcarpet', '~> 3.5.1'

gem 'geocoder'

gem 'mini_magick', ">=4.10.0"
gem 'rmagick', '~> 4.2.5'

gem 'acts_as_list'

gem 'kaminari' # pagination

gem 'stringex', '~> 2.5.2' # Provides String.to_ascii

gem 'naturally' # for sorting string naturally

gem 'retryable' # retry code blocks when they throw exceptions

# Used by `uglifier` to minify JS assets in the Asset Pipeline.
gem 'execjs'
# JavaScript runtime used by ExecJS.
gem 'mini_racer'

gem 'jwt', '~> 2.7.0'

# SMS API for send-to-phone feature; 6.0 includes some breaking changes which
# we'll need to prepare for:
# https://github.com/twilio/twilio-ruby/blob/6.0.0/UPGRADE.md#2023-05-03-5xx-to-6xx
gem 'twilio-ruby', '< 6.0'

gem 'sequel', '~> 5.29'
gem 'user_agent_parser'

gem 'paranoia', '~> 2.5.0'

# JSON model serializer for REST APIs.
gem 'active_model_serializers', '~> 0.10.13'

# AWS SDK and associated service APIs.
gem 'aws-sdk-acm'
gem 'aws-sdk-autoscaling'
gem 'aws-sdk-bedrockagentruntime', '~> 1.10.0'
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
gem 'aws-sdk-sagemakerruntime'
gem 'aws-sdk-secretsmanager'

# Lint tools
group :development, :staging, :levelbuilder, :test do
  gem 'haml_lint', require: false
  gem 'rubocop', '~> 1.28', require: false
  gem 'rubocop-performance', require: false
  gem 'rubocop-rails', require: false
  gem 'rubocop-rails-accessibility', require: false
  gem 'scss_lint', require: false
end

# Reduce volume of production logs
# Ref: https://github.com/roidrage/lograge/pull/252
gem 'lograge', github: 'code-dot-org/lograge', ref: 'debug_exceptions'
gem 'request_store', '~> 1.6.0', require: false

# Enforce SSL
gem 'rack-ssl-enforcer'

# PubSub for NetSim
gem 'pusher', '~> 1.3.1', require: false

gem 'youtube-dl.rb', group: [:development, :staging, :levelbuilder]

gem 'daemons', '1.1.9' # Pinned to old version, see PR 57938
gem 'httparty'
gem 'oj', '~> 3.10'

gem 'rest-client', '~> 2.0.1'

# A rest-client dependency
# This is the latest version that's installing successfully
gem 'unf_ext', '0.0.7.2'

# Generate SSL certificates.
gem 'acmesmith', '~> 2.3.1'

gem 'addressable'
# bcrypt version specified due to "Invalid Hash" error in Linux
gem 'bcrypt', '3.1.13'
gem 'sshkit'
gem 'validates_email_format_of'
gem 'validate_url', '~> 1.0.15'

gem 'composite_primary_keys', '~> 13.0'

# GitHub API; used by the DotD script to automatically create new
# releases on deploy
gem 'octokit'

# Used to create a prefix trie of student names within a section
gem 'full-name-splitter', github: 'pahanix/full-name-splitter'
gem 'rambling-trie', '>= 2.1.1'

gem 'omniauth-openid'

# Ref: https://github.com/toy/image_optim/pull/145
# Also include sRGB color profile conversion.
gem 'image_optim', github: 'code-dot-org/image_optim', ref: 'cdo'
# Image-optimization tools and binaries.
gem 'image_optim_pack', '~> 0.5.0', github: 'code-dot-org/image_optim_pack', ref: 'guetzli'
gem 'image_optim_rails', '~> 0.4.0'

gem 'image_size', require: false

# Auto strip model attributes before validation (opt in)
gem 'auto_strip_attributes', '~> 2.1'

# Used to sort UTF8 strings properly
gem 'sort_alphabetical', github: 'grosser/sort_alphabetical'

gem 'recaptcha', require: 'recaptcha/rails'

gem 'loofah', '~> 2.19.1'

# Install pg gem only on specific production hosts and the i18n-dev server.
require_pg = lambda do
  require 'socket'
  %w[production-daemon production-console i18n-dev].include?(Socket.gethostname)
end

install_if require_pg do
  gem 'pg', require: false
end

gem 'activerecord-import', '~> 1.0.3'
gem 'active_record_union'
gem 'scenic'
gem 'scenic-mysql_adapter'

gem 'colorize'

gem 'require_all', require: false

gem 'dotiw'

gem 'ruby-progressbar'

gem 'pry', '~> 0.14.0'

# Google's Compact Language Detector
gem 'cld'

gem 'crowdin-api', '~> 1.10.0'

gem "pycall", ">= 1.5.2"

gem "delayed_job_active_record", "~> 4.1"

gem 'rack-cors', '~> 2.0.1'

# pin http to 5.0 or greater so that statsig does not pull in an older version.
# older versions depend on http-parser which breaks some developer builds.
gem 'http', '~> 5.0'

gem 'statsig', '~> 1.33'

gem 'mailgun-ruby', '~>1.2.14'
gem 'mailjet', '~> 1.7.3'

gem 'json-jwt', '~> 1.15'
gem "json-schema", "~> 4.3"
