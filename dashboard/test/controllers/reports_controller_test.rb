require 'test_helper'

class ReportsControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
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

    @other_student = create(:user)
  end

  test "should setup properly" do
    assert_equal @script_level.script, @script_level2.script
  end

  test "should have two game groups if two stages" do
    get :header_stats, script_id: @script_level.script.id, user_id: @not_admin.id
    css = css_select "div.game-group"
    assert_equal 2, css.count
  end

  test 'should show lesson plan link if course[1,2,3], not if legacy curriculum' do
    sign_out(@not_admin)
    teacher = create(:teacher)
    sign_in(teacher)

    get :header_stats, script_id: Script::COURSE1_NAME, user_id: teacher.id
    assert_select '.stage-lesson-plan-link'

    get :header_stats, script_id: Script::COURSE2_NAME, user_id: teacher.id
    assert_select '.stage-lesson-plan-link'

    get :header_stats, script_id: Script::COURSE3_NAME, user_id: teacher.id
    assert_select '.stage-lesson-plan-link'

    get :header_stats, script_id: Script::COURSE4_NAME, user_id: teacher.id
    assert_select '.stage-lesson-plan-link'

    get :header_stats, script_id: Script::TWENTY_HOUR_NAME, user_id: teacher.id
    assert_select '.stage-lesson-plan-link', 0
  end

  test 'should show lesson plan link only if teacher' do
    sign_out(@not_admin)

    get :header_stats, script_id: Script::COURSE1_NAME
    assert_select '.stage-lesson-plan-link', 0

    teacher = create(:teacher)
    sign_in(teacher)

    get :header_stats, script_id: Script::COURSE1_NAME, user_id: teacher.id
    assert_select '.stage-lesson-plan-link'

    # Sign in as a student and make sure we're forbidden.
    sign_out(teacher)
    student = create(:student)
    sign_in(student)

    get :header_stats, script_id: Script::COURSE1_NAME, user_id: student.id
    assert_response :forbidden
  end

  test "should not show lesson plan link if student" do
    sign_out(@not_admin)
    student = create(:student)
    sign_in(student)

    get :header_stats, script_id: Script::COURSE1_NAME, user_id: student.id
    assert_select '.stage-lesson-plan-link', 0
  end

  test "should have valid lesson plan link if shown" do
    sign_out(@not_admin)
    teacher = create(:teacher)
    sign_in(teacher)

    course1 = Script.get_from_cache(Script::COURSE1_NAME)

    get :header_stats, script_id: course1.id, user_id: teacher.id

    unplugged_curriculum_path_start = "curriculum/#{course1.name}/"
    assert_select '.stage-lesson-plan-link a' do
      assert_select ":match('href', ?)", /.*#{unplugged_curriculum_path_start}\d.*/
    end
  end

  test "should get header_stats" do
    sign_out @admin

    get :header_stats
    assert_response :success
  end

  test "should get header_stats with user_id" do
    follower = create :follower

    sign_in follower.user

    get :header_stats, user_id: follower.student_user
    assert_response :success
  end

  test "should not get header_stats with unauthorized user_id" do
    sign_in @not_admin

    get :header_stats, user_id: @admin.id
    assert_response :forbidden
  end

  test "should not get header_stats with user_id when not signed in" do
    sign_out @admin

    get :header_stats, user_id: @admin.id
    assert_redirected_to_sign_in
  end

  test "should get header_stats with empty user_id" do
    get :header_stats, user_id: ''
    assert_response :success
  end

  test "should get header_stats if not signed in" do
    sign_out @admin
    get :header_stats
    assert_response :success
  end

  test "should get prizes" do
    get :prizes
    assert_response :success
  end

  test "should get prizes if not admin" do
    sign_in @not_admin
    get :prizes
    assert_response :success
  end

  test "should not get prizes if not signed in" do
    sign_out @admin
    get :prizes

    assert_redirected_to_sign_in
  end

  # 'report-stage-1' instead of 'report-stage-1: Report Stage 1'
  test "should render single stage name for custom script" do
    # first script has 1 stage, second script has 2 stages
    create(:script_level, script: @script, stage: @stage2)
    get :header_stats, script_id: @script.id
    # render string from test translation data
    assert_select 'div.stage', 2
    assert_select 'div.stage', 'Stage 1: report-stage-1'
  end

end
