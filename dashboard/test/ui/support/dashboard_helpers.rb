module DashboardHelpers
  # Requires the full rails environment. Use sparingly, known to take 20-30s.
  def require_rails_env
    require File.expand_path('../../../../config/environment.rb', __FILE__)
  end
end

World(DashboardHelpers)
