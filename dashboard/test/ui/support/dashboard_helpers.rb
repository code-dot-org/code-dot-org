module DashboardHelpers
  def require_rails_env
    require File.expand_path('../../../../config/environment.rb', __FILE__)
  end
end

World(DashboardHelpers)
