module DashboardHelpers
  # Requires the full rails environment. Use sparingly, known to take 20-30s.
  def require_rails_env
    start_time = Time.now
    puts "require_rails_env starting at #{start_time}"
    require File.expand_path('../../../../config/environment.rb', __FILE__)
    end_time = Time.now
    puts "require_rails_env finished at #{end_time} (completed in #{end_time - start_time} seconds)"
  end
end

World(DashboardHelpers)
