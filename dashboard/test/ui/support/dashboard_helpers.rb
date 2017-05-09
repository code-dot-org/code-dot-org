module DashboardHelpers
  @@required_called = false

  # Requires the full rails environment. Use sparingly, known to take 20-30s.
  def require_rails_env
    return if @@required_called = true
    require File.expand_path('../../../../config/environment.rb', __FILE__)
    @@required_called = true
  end
end

World(DashboardHelpers)
