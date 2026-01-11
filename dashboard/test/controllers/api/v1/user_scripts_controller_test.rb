require 'test_helper'

class Api::V1::UserScriptsControllerTest < ActionDispatch::IntegrationTest
  test "student can dismiss version warning via course_id and script_id" do
    unit_group = create(:single_unit_course, :stable)
    unit = unit_group.first_unit
    user_script = create(:user_script, script: unit, unit_group: unit_group)
    sign_in user_script.user
    patch "/api/v1//user_scripts/course/#{unit_group.id}/unit/#{unit.id}", params: {
      version_warning_dismissed: true
    }
    assert_response :success
    user_script.reload
    assert_equal "true", user_script.version_warning_dismissed
  end

  test "student without user_script can dismiss via course_id and script_id" do
    user = create(:user)
    script = create(:unit, :in_single_unit_course)
    sign_in user
    course_id = script.get_original_unit_group.id
    patch "/api/v1//user_scripts/course/#{course_id}/unit/#{script.id}", params: {
      version_warning_dismissed: true
    }
    assert_response :success
    user_script = UserScript.find_by(user: user, script: script)
    refute_nil user_script
    assert_equal script.get_original_unit_group.id, user_script.unit_group_id
    assert_equal "true", user_script.version_warning_dismissed
  end

  test "not found for nonexistent course or unit" do
    user = create(:user)
    sign_in user
    patch "/api/v1//user_scripts/course/999999/unit/999999", params: {
      version_warning_dismissed: true
    }
    assert_response :not_found
  end

  test "not found for nonexistent unit with valid course" do
    user = create(:user)
    unit_group = create(:single_unit_course, :stable)
    sign_in user
    bogus_script_id = 10_000_000
    patch "/api/v1//user_scripts/course/#{unit_group.id}/unit/#{bogus_script_id}", params: {
      version_warning_dismissed: true
    }
    assert_response :not_found
    user_script = UserScript.find_by(user: user, script: bogus_script_id)
    assert_nil user_script
  end

  test "not found for nonexistent course with valid unit" do
    user = create(:user)
    unit = create(:unit, :in_single_unit_course)
    sign_in user
    bogus_course_id = 10_000_000
    patch "/api/v1//user_scripts/course/#{bogus_course_id}/unit/#{unit.id}", params: {
      version_warning_dismissed: true
    }
    assert_response :not_found
    user_script = UserScript.find_by(user: user, script: unit)
    assert_nil user_script
  end
end
