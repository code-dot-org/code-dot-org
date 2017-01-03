source 'https://rubygems.org'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 5.0.0'
gem 'rails-controller-testing'

gem 'sprockets', '~> 3.6.3'
gem 'sprockets-rails', '~> 3.1.1'

# provide `respond_to` methods
# (see: http://guides.rubyonrails.org/4_2_release_notes.html#respond-with-class-level-respond-to)
gem 'responders', '~> 2.0'

gem 'sinatra', '~> 2.0.0.beta2', require: 'sinatra/base'

gem 'mysql2', '~> 0.3.13'
# Ref: https://github.com/bdurand/seamless_database_pool/issues/28
# Ref: https://github.com/bdurand/seamless_database_pool/issues/31
# Ref: https://github.com/bdurand/seamless_database_pool/pull/33
gem 'seamless_database_pool', github: 'wjordan/seamless_database_pool', ref: 'cdo'

gem 'le', '~> 2.2'
gem 'os'
gem 'redis', '~> 3.3.1'
# Using own fork until upstream publishes new version with multi return value fix
# See https://github.com/cheald/redis-slave-read/pull/2
gem 'redis-slave-read', require: false, github: 'islemaster/redis-slave-read', ref: 'start-with-random-node'
gem 'google_drive', '~> 1.0.0'
gem 'dalli' # memcached
gem 'parallel'

gem 'google-api-client'

gem 'crowdin-cli'

# CSRF protection for Sinatra.
gem 'rack_csrf'

group :development do
  gem 'annotate'
  gem 'rack-mini-profiler'
  gem 'ruby-progressbar', require: false
  gem 'thin'
  gem 'web-console'
  gem 'memoist'
end

group :development, :test do
  gem 'rerun', '~> 0.10.0'
  gem 'shotgun'
  gem 'rack-cache'
  # Use debugger
  #gem 'debugger' unless ENV['RM_INFO']

  gem 'haml-rails' # haml (instead of erb) generators
  gem 'better_errors'
  gem 'binding_of_caller'
  gem 'ruby-prof'
  gem 'active_record_query_trace'
  # for unit testing
  gem 'webmock', require: false
  gem 'vcr', require: false

  gem 'simplecov', '~> 0.9', require: false
  gem 'coveralls', require: false # test coverage; https://coveralls.zendesk.com/hc/en-us/articles/201769485-Ruby-Rails
  gem 'mocha', require: false
  gem 'sqlite3'
  gem 'timecop'
  gem 'fake_sqs'
  gem 'fakeredis', require: false

  # for ui testing
  gem 'cucumber', '~> 2.0.2'
  gem 'selenium-webdriver', '~> 3.0.3'
  gem 'rspec'
  gem 'chromedriver-helper', '~> 0.0.7'
  gem 'colorize'
  gem 'spring'
  gem 'spring-commands-testunit'
  gem "minitest", "~> 5.5"
  gem 'minitest-reporters'
  gem 'minitest-around'
  gem 'net-http-persistent'
  gem 'eyes_selenium', '~> 2.38.0'

  # for pegasus PDF generation / merging testing
  gem 'pdf-reader', require: false
end

group :doc do
  # bundle exec rake doc:rails generates the API under doc/api.
  gem 'sdoc', require: false
end

# needed for unit testing, and also for /rails/mailers email previews
gem 'factory_girl_rails', group: [:development, :staging, :test, :adhoc]

# for pegasus PDF generation
gem 'open_uri_redirections', require: false, group: [:development, :staging, :test]

gem 'unicorn', '~> 5.1.0'

gem 'chronic', '~> 0.10.2'

# Use SCSS for stylesheets
# Ref: https://github.com/rails/sass-rails/pull/386
gem 'sass-rails', github: 'wjordan/sass-rails', ref: 'frozen-array-fix'

# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'

# Use jquery as the JavaScript library
gem 'jquery-rails'

gem 'phantomjs', '~> 1.9.7.1'

# for emoji in utility output
gem 'gemoji'

# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.5'

# authentication and permissions
gem 'devise'
gem 'devise_invitable', '~> 1.6.0'
gem 'cancancan', '~> 1.15.0'

gem 'omniauth-facebook', '~> 4.0.0.rc1'
gem 'omniauth-google-oauth2', '~> 0.3.1'
# Ref: https://github.com/joel/omniauth-windowslive/pull/16
# Ref: https://github.com/joel/omniauth-windowslive/pull/17
gem 'omniauth-windowslive', '~> 0.0.11', github: 'wjordan/omniauth-windowslive', ref: 'cdo'
# Ref: https://github.com/Clever/omniauth-clever/pull/7
gem 'omniauth-clever', '~> 1.2.1', github: 'Clever/omniauth-clever'
# Ref: https://github.com/instructure/ims-lti/pull/90
gem 'ims-lti', github: 'wjordan/ims-lti', ref: 'oauth_051'

gem 'bootstrap-sass', '~> 2.3.2.2'
gem 'haml'

gem 'jquery-ui-rails', '~> 5.0.3'

gem 'nokogiri', '~> 1.6.1'

gem 'highline', '~> 1.6.21'

gem 'honeybadger' # error monitoring

gem 'newrelic_rpm', '~> 3.16.0', group: [:staging, :development, :production] # perf/error/etc monitoring

gem 'redcarpet', '~> 3.3.4'

# Ref: https://github.com/alexreisner/geocoder/pull/1085 (pending new RubyGems release)
gem 'geocoder', github: 'wjordan/geocoder', ref: 'rack-request-fix'

gem 'rmagick'
gem 'mini_magick'

gem 'acts_as_list'

gem 'kaminari' # pagination

gem 'stringex', '~> 2.5.2' # Provides String.to_ascii

gem 'naturally' # for sorting string naturally

gem 'retryable' # retry code blocks when they throw exceptions

# Used by a build script.
gem 'execjs'
gem 'therubyracer', '~> 0.12.2', platforms: :ruby

gem 'jwt' # single signon for zendesk

gem 'codemirror-rails' # edit code in textarea
gem 'marked-rails' # js-based md renderer used for levelbuilder md preview

gem 'twilio-ruby' # SMS API for send-to-phone feature

gem 'font-awesome-rails', '~> 4.6.3'
gem 'sequel', '~> 4.10'
gem 'user_agent_parser'

gem "paranoia", "~> 2.2.0.pre" # 'delete' Rails model objects by setting a deleted_at column instead of deleting the row

# JSON model serializer for REST APIs
gem 'active_model_serializers', github: 'rails-api/active_model_serializers', ref: '2962f3f64e7c672bfb5a13a8f739b5db073e5473'
gem 'aws-sdk', '~> 2'

# Lint tools
group :development, :staging do
  gem 'rubocop', '0.45.0', require: false
  gem 'haml_lint', require: false
  gem 'scss_lint', require: false
end

# Reduce volume of production logs
gem 'lograge'

# Enforce SSL
gem 'rack-ssl-enforcer'

# PubSub for NetSim
gem 'pusher', '~> 1.3.0', require: false

gem 'youtube-dl.rb', group: [:development, :staging, :levelbuilder]

gem 'net-ssh'
gem 'net-scp'
gem 'httparty'
gem 'oj'
gem 'daemons'

gem 'rest-client', '~> 2.0'

gem 'rack-attack', '~> 4.4'

# Generate SSL certificates
gem 'acmesmith'

gem 'firebase'
gem 'firebase_token_generator'
gem "selectize-rails"
gem 'bcrypt'
gem 'addressable'
gem 'validates_email_format_of'
gem 'sshkit'
