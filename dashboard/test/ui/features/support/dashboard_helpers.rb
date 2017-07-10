module DashboardHelpers
  # Requires the full rails environment. Use sparingly, known to take 20-30s.
  def require_rails_env
    puts 'Requiring rails env'
    start = Time.now
    require File.expand_path('../../../../../config/environment.rb', __FILE__)
    finish = Time.now
    puts "Requiring rails env took #{finish - start} seconds"
  end
end

World(DashboardHelpers)
