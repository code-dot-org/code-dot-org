module DashboardHelpers
  # Requires the full rails environment. Use sparingly, known to take 20-30s.
  def require_rails_env
    require File.expand_path('../../../../config/environment.rb', __FILE__)
  end

  # Requires rails environment to be loaded.
  # Use sparingly - this is slow and memory-intensive.
  def create_admin_user(name, email, password)
    User.find_or_create_by!(email: email) do |user|
      user.name = name
      user.password = password
      user.user_type = User::TYPE_TEACHER
      user.age = 21
      user.confirmed_at = Time.now
      user.admin = true
    end
  end
end

World(DashboardHelpers)
