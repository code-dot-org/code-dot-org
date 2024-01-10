Rails.application.config.local_requests_conditional = false
if Rails.application.config.consider_all_requests_local && Rails.application.config.levelbuilder_mode
  Rails.application.config.local_requests_conditional = true
end
