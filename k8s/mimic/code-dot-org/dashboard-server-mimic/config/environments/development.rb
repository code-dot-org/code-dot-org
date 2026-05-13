Rails.application.configure do
  config.cache_classes = false
  config.enable_reloading = true
  config.action_controller.perform_caching = false
  config.server_timing = true
end
