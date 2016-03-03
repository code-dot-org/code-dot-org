require 'test_helper'

class AdminReportsControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
    # Stub the DB[:forms] table (used by :hoc_signups).
    DB.stubs(:[]).returns(stub(:where => stub(:group => stub(:group_and_count => stub(:order => stub(:all => []))))))
    # Stub used by :admin_stats.
    Properties.stubs(:get).returns(nil)

    @admin = create(:admin)
    sign_in(@admin)

    @not_admin = create(:user, username: 'notadmin')

    @script = create(:script, name: 'Report Script')
    @stage = create(:stage, script: @script, name: 'Report Stage 1')
    @stage2 = create(:stage, script: @script, name: 'Report Stage 2')
    @script_level = create(:script_level, script: @script, stage: @stage)
    @script_level2 = create(:script_level, script: @script, stage: @stage2)
    @script_level.move_to_bottom
    @script_level2.move_to_bottom

    @teacher = create(:teacher)
    @teacher_section = create(:section, :user => @teacher)

    @student = create(:user)
    @follower = Follower.create(:section => @teacher_section, :user => @teacher, :student_user => @student)
  end

  generate_admin_only_tests_for :all_usage
  generate_admin_only_tests_for :admin_progress
  generate_admin_only_tests_for :admin_stats
  generate_admin_only_tests_for :debug
  generate_admin_only_tests_for :funometer
  generate_admin_only_tests_for :level_answers
  generate_admin_only_tests_for :funometer_by_script, script_id: 1
  generate_admin_only_tests_for :funometer_by_script_level, script_id: 1, level_id: 1
  generate_admin_only_tests_for :hoc_signups
  generate_admin_only_tests_for :retention
  generate_admin_only_tests_for :retention_stages

  test 'should get admin progress page' do
    get :admin_progress
    assert_select 'h1', 'Admin progress'
  end

end
