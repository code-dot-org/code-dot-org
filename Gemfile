source 'https://rubygems.org'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 4.2.6'

# provide `respond_to` methods
# (see: http://guides.rubyonrails.org/4_2_release_notes.html#respond-with-class-level-respond-to)
gem 'responders', '~> 2.0'

gem 'sinatra', require: 'sinatra/base'
gem 'rack-contrib', '~> 1.1'

gem 'mysql2', '~> 0.3.13'
gem 'seamless_database_pool'

gem 'le', '~> 2.2'
gem 'os'
gem 'redis', '~> 3.1.0'
gem 'google_drive', '~> 1.0.0'
gem 'dalli' # memcached
gem 'parallel'

gem 'google-api-client'
gem 'sprockets-derailleur' # Multi-cpu assets precompile

gem 'crowdin-cli'

# CSRF protection for Sinatra.
gem 'rack_csrf'

group :development do
  gem 'annotate', '~> 2.6.6'
  gem 'rack-mini-profiler'
  gem 'rerun', '~> 0.10.0'
  gem 'shotgun'
  gem 'thin', '~> 1.6.2'
  gem 'web-console', '~> 2.0'
end

group :development, :test do
  gem 'rack-cache'
  # Use debugger
  #gem 'debugger' unless ENV['RM_INFO']
  gem 'konacha'  # Mocha + Chai JS testing in Rails
  gem 'poltergeist'  # Headless JS tests.p

  gem 'haml-rails' # haml (instead of erb) generators
  gem 'better_errors'
  gem 'binding_of_caller'
  gem 'ruby-prof'
  gem 'quiet_assets'
  gem 'active_record_query_trace'
  # for unit testing
  gem 'factory_girl_rails'
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
  gem 'cucumber'
  gem 'selenium-webdriver', '~> 2.45.0'
  gem 'rspec'
  gem 'chromedriver-helper', '~> 0.0.7'
  gem 'colorize'
  gem 'spring'
  gem 'spring-commands-testunit'
  gem "minitest", "~> 5.5"
  gem 'minitest-reporters'
  gem 'minitest-around'
  gem 'eyes_selenium', '~> 2.28.0'
end

group :doc do
  # bundle exec rake doc:rails generates the API under doc/api.
  gem 'sdoc', require: false
end

gem 'unicorn', '~> 4.8.2'

gem 'chronic', '~> 0.10.2'

# Use SCSS for stylesheets
gem 'sass-rails', '~> 4.0.0'

# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'

# Use jquery as the JavaScript library
gem 'jquery-rails', '~> 3.1.0'

gem 'phantomjs', '~> 1.9.7.1'

# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 1.2'

# authentication and permissions
gem 'devise'
gem 'devise_invitable', '~> 1.5.2'
gem 'cancancan', '~> 1.10' #CanCan is dead, long live CanCanCan

gem 'omniauth-facebook'
gem 'omniauth-google-oauth2'
gem 'omniauth-windowslive', '~> 0.0.9'
gem 'omniauth-clever', '~> 1.2.1'

gem 'bootstrap-sass', '~> 2.3.2.2'
gem 'haml'

gem 'jquery-ui-rails', '~> 5.0.3'

gem 'nokogiri', '~> 1.6.1'

gem 'highline', '~> 1.6.21'

gem 'honeybadger', '~> 1.11' # error monitoring

gem 'newrelic_rpm', '~> 3.10.0.279', group: [:staging, :production] # perf/error/etc monitoring

gem 'redcarpet', '~> 3.3.4'

gem 'geocoder'

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

gem 'font-awesome-rails'
gem 'sequel', '~> 4.10.0'
gem 'user_agent_parser'

gem 'heroku_rails_deflate', group: [:staging, :production, :test, :levelbuilder] # gzip rails content and static assets
# We don't use this gem in development because it doesn't work with rack-mini-profiler.

gem "paranoia", "~> 2.0" # 'delete' Rails model objects by setting a deleted_at column instead of deleting the row

# JSON model serializer for REST APIs
gem 'active_model_serializers', github: 'rails-api/active_model_serializers', ref: '2962f3f64e7c672bfb5a13a8f739b5db073e5473'
gem 'aws-sdk', '~> 2'

gem 'rubocop', '0.37.2', require: false, group: [:development, :staging]
gem 'haml_lint', require: false, group: [:development, :staging]

# Reduce volume of production logs
gem 'lograge'

# Enforce SSL
gem 'rack-ssl-enforcer'

# PubSub for NetSim
gem 'pusher', '~> 0.14.5'

gem 'youtube-dl.rb', group: [:development, :staging, :levelbuilder]

gem 'net-ssh'
gem 'net-scp'
gem 'httparty'
gem 'jquery-cookie-rails'
gem 'oj'
gem 'daemons'

gem 'rest-client', '~> 1.8'

gem 'rack-attack', '~> 4.4'

# Generate SSL certificates
gem 'acmesmith'
