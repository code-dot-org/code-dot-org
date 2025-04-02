require 'test_helper'

class MakerControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  STUB_ENCRYPTION_KEY = SecureRandom.base64(Encryption::KEY_LENGTH / 8)

  setup do
    @student = create :student
    @teacher = create :teacher

    # Create 3 versions of the devices unit where one is assigned to the user,
    # one is the version the user most recently made progress in, and the other
    # is the most recent version (for testing that MakerController.maker_script
    # prioritizes an assigned unit version over a unit the user has progress in
    # over the newest version).
    @assigned_devices_version = ensure_script 'devices-assigned', '2020'
    @recent_progress_devices_version = ensure_script 'devices-progress', '2021'
    @most_recent_devices_version = ensure_script 'devices-recent', '2022'

    Unit.clear_cache
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

  private def ensure_script(script_name, version_year = '2000', is_stable = true)
    Unit.find_by_name(script_name) ||
      create(:script, name: script_name, family_name: 'devices', version_year: version_year, published_state: is_stable ? Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable : Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview).tap do |script|
        lesson_group = create :lesson_group, script: script
        lesson = create :lesson, script: script, lesson_group: lesson_group
        create :script_level, script: script, lesson: lesson
      end
  end
end
