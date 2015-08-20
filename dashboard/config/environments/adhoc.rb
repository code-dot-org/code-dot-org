# The adhoc environment extends the staging environment.
# It is used for testing a branch in a staging-like environment with
# a local database and a load balancer.
require Rails.root.join('config/environments/staging')

Dashboard::Application.configure do
  # Show full error reports
  config.consider_all_requests_local       = true
end
