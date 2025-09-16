require 'test_helper'

class Api::V1::UserScriptsControllerTest < ActionDispatch::IntegrationTest
  test "student can dismiss version warning" do
    user_script = create(:user_script)
    sign_in user_script.user
    patch "/api/v1//user_scripts/#{user_script.script.id}", params: {
      version_warning_dismissed: true
    }
    assert_response :success
    user_script.reload
    assert_equal "true", user_script.version_warning_dismissed
  end

  test "student without user_script can dismiss version warning" do
    user = create(:user)
    script = create(:unit, :in_single_unit_course)
    sign_in user
    patch "/api/v1//user_scripts/#{script.id}", params: {
      version_warning_dismissed: true
    }
    assert_response :success
    user_script = UserScript.find_by(user: user, script: script)
    refute_nil user_script
    assert_nil user_script.unit_group_id
    assert_equal "true", user_script.version_warning_dismissed
  end

  test "raises for nonexistent script" do
    user = create(:user)
    sign_in user
    bogus_script_id = 10_000_000
    patch "/api/v1//user_scripts/#{bogus_script_id}", params: {
      version_warning_dismissed: true
    }
    assert_response :missing
    user_script = UserScript.find_by(user: user, script: bogus_script_id)
    assert_nil user_script
  end

  test "student can dismiss version warning via course_name and unit_position" do
    user_script = create(:user_script)
    sign_in user_script.user
    course_name = user_script.script.get_original_unit_group.name
    patch "/api/v1//user_scripts/courses/#{course_name}/units/1", params: {
      version_warning_dismissed: true
    }
    assert_response :success
    user_script.reload
    assert_equal "true", user_script.version_warning_dismissed
  end

  test "student without user_script can dismiss via course_name and unit_position" do
    user = create(:user)
    script = create(:unit, :in_single_unit_course)
    sign_in user
    course_name = script.get_original_unit_group.name
    patch "/api/v1//user_scripts/courses/#{course_name}/units/1", params: {
      version_warning_dismissed: true
    }
    assert_response :success
    user_script = UserScript.find_by(user: user, script: script)
    refute_nil user_script
    assert_equal script.get_original_unit_group.id, user_script.unit_group_id
    assert_equal "true", user_script.version_warning_dismissed
  end

  test "raises for nonexistent course/unit" do
    user = create(:user)
    sign_in user
    patch "/api/v1//user_scripts/courses/nonexistent-course/units/99", params: {
      version_warning_dismissed: true
    }
    assert_response :missing
  end
end
