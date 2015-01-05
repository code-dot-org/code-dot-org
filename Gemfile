source 'https://rubygems.org'
ruby '2.0.0'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '4.0.3'

gem 'sinatra', '1.4.4', require: 'sinatra/base'
gem 'rack-contrib', '~> 1.1'

gem 'mysql2', '0.3.13'
gem 'seamless_database_pool'

gem 'le', '~> 2.2'
gem 'os'
gem 'redis', '~> 3.1.0'
gem 'google_drive', '~> 0.3.10'

group :development do
  gem 'rerun', '~> 0.10.0'
  gem 'shotgun'
  gem 'thin', '~> 1.6.2'
end

group :development, :test do
  # Use debugger
  #gem 'debugger' unless ENV['RM_INFO']
  gem 'haml-rails' # haml (instead of erb) generators
  gem 'better_errors'
  gem 'binding_of_caller'
  gem 'ruby-prof'
  gem 'quiet_assets'
  gem 'active_record_query_trace'

  # for unit testing
  gem 'factory_girl_rails'
  gem 'simplecov', require: false
  gem 'mocha', require: false
  gem "codeclimate-test-reporter", require: false
  gem 'timecop'

  # for ui testing
  gem 'cucumber'
  gem 'selenium-webdriver'
  gem 'rspec'
  gem 'chromedriver-helper', '~> 0.0.7'
  gem 'colorize'
  gem 'parallel'
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
gem 'jquery-rails'

gem 'phantomjs', '~> 1.9.7.1'

# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 1.2'

# authentication and permissions
gem 'devise'
gem 'cancan'

gem 'omniauth-facebook'
gem 'omniauth-google-oauth2'
gem 'omniauth-windowslive', '~> 0.0.9'
gem 'omniauth-clever', git: 'https://github.com/code-dot-org/omniauth-clever.git'

gem 'bootstrap-sass', '~> 2.3.2.2'
gem 'haml'

gem 'jquery-ui-rails'

gem 'nokogiri', '1.6.1'

gem 'highline', '~> 1.6.21'

gem 'honeybadger'

gem 'redcarpet', '~> 3.1.1'

gem 'newrelic_rpm'

gem 'geocoder'

gem 'rmagick', require: 'RMagick'

gem 'acts_as_list'

gem 'kaminari' # pagination

gem 'stringex', '~> 2.5.2' # Provides String.to_ascii

gem 'naturally' # for sorting string naturally

gem 'videojs_rails'

gem 'retryable' # retry code blocks when they throw exceptions

# Used by a build script.
gem 'execjs'
gem 'therubyracer', :platforms => :ruby
gem 'i18nema', group: :fast_loc  # faster locale backend (active in dev environment or FAST_LOC=true)

gem 'jwt' # single signon for zendesk

gem 'codemirror-rails' # edit code in textarea

gem 'twilio-ruby' # SMS API for send-to-phone feature
gem 'aws-s3'

gem 'font-awesome-rails'
gem 'sequel', '~> 4.10.0'
gem 'user_agent_parser'
gem 'heroku_rails_deflate', :group => [:staging, :test, :production] # gzip rails content and static assets
