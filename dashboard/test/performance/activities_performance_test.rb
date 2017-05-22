require 'test_helper'
require 'rails/performance_test_help'

# Test basic activity-processing performance
class ActivitiesPerformanceTest < ActionDispatch::PerformanceTest
  self.profile_options = {
    runs: 10,
    metrics: [:wall_time],
    benchmark: true
  }

  setup do
    Rails.logger.level = ActiveSupport::Logger::INFO
    Script.stubs(:should_cache?).returns true
    @script_level = Script.get_from_cache(Script::HOC_NAME).script_levels.first
    @milestone_params = {lines: 20, attempt: '1', result: 'true', testResult: '100', time: '1000', app: 'test', program: '<hey>'}

    # Do a warm-up post to profile the second post only.
    post "/milestone/#{@user ? @user.id : 0}/#{@script_level.id}", params: @milestone_params
    Rails.logger.level = ActiveSupport::Logger::DEBUG
  end

  test 'milestone' do
    post "/milestone/#{@user ? @user.id : 0}/#{@script_level.id}", params: @milestone_params.merge(attempt: '2')
  end
end

class LoginActivitiesPerformanceTest < ActivitiesPerformanceTest
  setup do
    Rails.logger.level = ActiveSupport::Logger::INFO
    @user = create(:user)
    sign_in @user
    # Do a warm-up post to profile the second post only.
    post "/milestone/#{@user ? @user.id : 0}/#{@script_level.id}", params: @milestone_params
    Rails.logger.level = ActiveSupport::Logger::DEBUG
  end
end
