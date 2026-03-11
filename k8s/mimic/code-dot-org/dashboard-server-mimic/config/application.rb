require_relative "boot"

$LOAD_PATH.unshift(File.expand_path("../../lib", __dir__))
require "cdo"

require "rails"
require "action_controller/railtie"

module DashboardServerMimic
  class Application < Rails::Application
    config.load_defaults 7.0
    config.eager_load = false
    config.consider_all_requests_local = true
    config.hosts.clear
    config.secret_key_base = "dashboard-server-mimic-secret-key-base"
    config.logger = ActiveSupport::Logger.new($stdout)
    config.log_level = :info
  end
end
