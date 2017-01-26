require 'test_helper'

class AdminReportsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    # Stub used by :admin_stats.
    Properties.stubs(:get).returns(nil)

    @admin = create(:admin)
    sign_in(@admin)

    @not_admin = create(:user, username: 'notadmin')

    @script = create(:script, name: 'report-script')
    @stage = create(:stage, script: @script, name: 'Report Stage 1')
    @stage2 = create(:stage, script: @script, name: 'Report Stage 2')
    @script_level = create(:script_level, script: @script, stage: @stage, position: 1)
    @script_level2 = create(:script_level, script: @script, stage: @stage2, position: 2)

    @teacher = create(:teacher)
    @teacher_section = create(:section, user: @teacher)

    @student = create(:user)
    @follower = Follower.create(section: @teacher_section, user: @teacher, student_user: @student)
  end

  generate_admin_only_tests_for :admin_progress
  generate_admin_only_tests_for :admin_stats
  generate_admin_only_tests_for :debug
  generate_admin_only_tests_for :directory
  generate_admin_only_tests_for :level_answers

  test 'should get admin progress page' do
    get :admin_progress
    assert_select 'h1', 'Admin progress'
  end

  test 'pd_progress should return 404 for unfound script' do
    get :pd_progress, params: {script: 'bogus-nonexistent-script-name'}
    assert_response :not_found
  end

  test 'pd_progress should sanitize script.name' do
    evil_script = Script.new(
      name: %q(<script type="text/javascript">alert('XSS');</script>)
    )
    Script.stubs(:get_from_cache).returns(evil_script)

    get :pd_progress, params: {
      script: %q(<script type="text/javascript">alert('XSS');</script>)
    }

    assert_response :not_found
    refute @response.body.include? '<script type="text/javascript">'
  end
end
