# The adhoc environment extends the staging environment.
# It is used for testing a branch in a staging-like environment with
# a local database and a load balancer.
require Rails.root.join('config/environments/staging')

Dashboard::Application.configure do
  # Code is not reloaded between requests.
  config.cache_classes = true

  # Eager load code on boot. This eager loads most of Rails and
  # your application in memory, allowing both thread web servers
  # and those relying on copy on write to perform better.
  # Rake tasks automatically ignore this option for performance.
  config.eager_load = true

  # Disable full error reports for profiling/load-testing, due to memory leak:
  # https://github.com/rails/rails/issues/27273
  config.consider_all_requests_local = false

  config.action_controller.perform_caching = true
  config.public_file_server.enabled = true
  config.public_file_server.headers = {'Cache-Control' => "public, max-age=86400, s-maxage=43200"}

  # Set to :debug to see everything in the log.
  config.log_level = :info

  # Version of your assets, change this if you want to expire all your assets.
  config.assets.version = '1.0'

  # Use default logging formatter so that PID and timestamp are not suppressed.
  config.log_formatter = ::Logger::Formatter.new

  # Log condensed lines to syslog for centralized logging.
  config.lograge.enabled = true
  config.lograge.formatter = Lograge::Formatters::Cee.new
  require 'syslog/logger'
  config.logger = Syslog::Logger.new 'dashboard', Syslog::LOG_LOCAL0

  # Show mail previews (rails/mailers).
  # See http://edgeguides.rubyonrails.org/action_mailer_basics.html#previewing-emails
  config.action_mailer.show_previews = true
end
