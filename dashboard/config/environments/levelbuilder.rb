# levelbuilder environment extends the staging environment
require Rails.root.join('config/environments/staging')

Dashboard::Application.configure do
  # Show full error reports
  config.consider_all_requests_local = true

  # don't act like a levelbuilder by default
  config.levelbuilder_mode = CDO.with_default(true).levelbuilder_mode

  # Set to :debug to see everything in the log.
  config.log_level = :info

  # Disable Rails.cache on levelbuilder (until code-dot-org/code-dot-org#8844 is merged)
  config.cache_store = :null_store
end
