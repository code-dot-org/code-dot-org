require 'test_helper'

class AdminReportsControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  generate_admin_only_tests_for :all_usage
  generate_admin_only_tests_for :admin_concepts
  generate_admin_only_tests_for :admin_progress
  generate_admin_only_tests_for :admin_stats
  generate_admin_only_tests_for :funometer
  generate_admin_only_tests_for :level_completions
  generate_admin_only_tests_for :pd_progress

  test 'should get admin progress page' do
    get :admin_progress
    assert_select 'h1', 'Admin progress'
  end

end
