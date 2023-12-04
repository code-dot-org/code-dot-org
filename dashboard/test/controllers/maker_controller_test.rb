require 'test_helper'

class MakerControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @student = create :student
    @teacher = create :teacher
    @admin = create :admin
    @school = create :school

    # Create 3 versions of the devices unit where one is assigned to the user,
    # one is the version the user most recently made progress in, and the other
    # is the most recent version (for testing that MakerController.maker_script
    # prioritizes an assigned unit version over a unit the user has progress in
    # over the newest version).
    @assigned_devices_version = ensure_script 'devices-assigned', '2020'
    @recent_progress_devices_version = ensure_script 'devices-progress', '2021'
    @most_recent_devices_version = ensure_script 'devices-recent', '2022'

    Unit.clear_cache
    Cpa.stubs(:cpa_experience).
      with(any_parameters).
      returns(Cpa::NEW_USER_LOCKOUT)
  end

  test_redirect_to_sign_in_for :home

  test "home loads for student" do
    sign_in @student

    get :home

    assert_response :success
    assert_select '#maker-home'
  end

  test "home loads for teacher" do
    sign_in @teacher

    get :home

    assert_response :success
    assert_select '#maker-home'
  end

  test "shows latest stable devices version if it is assigned" do
    create :user_script, user: @student, script: @most_recent_devices_version, assigned_at: Time.now
    assert_includes @student.scripts, @most_recent_devices_version

    assert_equal @most_recent_devices_version, MakerController.maker_script(@student)
  end

  test "prioritizes assigned devices version to show user" do
    section = create :section, user: @teacher, script: @assigned_devices_version
    create :user_script, user: @student, script: @assigned_devices_version, assigned_at: Time.now
    section.students << @student
    recent_progress_script = create :user_script, user: @student, script: @recent_progress_devices_version, last_progress_at: Time.now
    assert_includes @student.scripts, @assigned_devices_version
    assert_equal recent_progress_script, @student.user_script_with_most_recent_progress

    assert_equal @assigned_devices_version, MakerController.maker_script(@student)
  end

  test "prioritizes recent progress in devices version to show user if no versions assigned" do
    recent_progress_script = create :user_script, user: @student, script: @recent_progress_devices_version, last_progress_at: Time.now
    assert_equal recent_progress_script, @student.user_script_with_most_recent_progress

    assert_equal @recent_progress_devices_version, MakerController.maker_script(@student)
  end

  test "defaults to newest stable devices version if user has no assignments or progress in any version" do
    assert_empty @student.scripts
    assert_empty @student.section_courses
    assert_nil @student.user_script_with_most_recent_progress

    assert_equal @most_recent_devices_version, MakerController.maker_script(@student)
  end

  private

  def ensure_script(script_name, version_year = '2000', is_stable = true)
    Unit.find_by_name(script_name) ||
      create(:script, name: script_name, family_name: 'devices', version_year: version_year, published_state: is_stable ? Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable : Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview).tap do |script|
        lesson_group = create :lesson_group, script: script
        lesson = create :lesson, script: script, lesson_group: lesson_group
        create :script_level, script: script, lesson: lesson
      end
  end
end
