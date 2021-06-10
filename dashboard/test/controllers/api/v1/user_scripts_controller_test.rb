require 'test_helper'

class Api::V1::UserScriptsControllerTest < ActionDispatch::IntegrationTest
  test "student can dismiss version warning" do
    user_script = create :user_script
    sign_in user_script.user
    patch "/api/v1//user_scripts/#{user_script.script.id}", params: {
      version_warning_dismissed: true
    }
    assert_response :success
    user_script.reload
    assert_equal "true", user_script.version_warning_dismissed
  end

  test "student without user_script can dismiss version warning" do
    user = create :user
    script = create :script
    sign_in user
    patch "/api/v1//user_scripts/#{script.id}", params: {
      version_warning_dismissed: true
    }
    assert_response :success
    user_script = UserScript.find_by(user: user, script: script)
    refute_nil user_script
    assert_equal "true", user_script.version_warning_dismissed
  end

  test "raises for nonexistent script" do
    user = create :user
    sign_in user
    bogus_script_id = 99999
    patch "/api/v1//user_scripts/#{bogus_script_id}", params: {
      version_warning_dismissed: true
    }
    assert_response :missing
    user_script = UserScript.find_by(user: user, script: bogus_script_id)
    assert_nil user_script
  end
end
