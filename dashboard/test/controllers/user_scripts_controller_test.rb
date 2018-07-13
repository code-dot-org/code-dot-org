require 'test_helper'

class UserScriptsControllerTest < ActionController::TestCase
  test "student can dismiss version warning" do
    user_script = create :user_script
    sign_in user_script.user
    patch :update, params: {script_id: user_script.script.id, version_warning_dismissed: true}
    assert_response :success
    user_script.reload
    assert_equal "true", user_script.version_warning_dismissed
  end

  test "student without user_script can dismiss version warning" do
    user = create :user
    script = create :script
    sign_in user
    patch :update, params: {script_id: script.id, version_warning_dismissed: true}
    assert_response :success
    user_script = UserScript.find_by(user: user, script: script)
    refute_nil user_script
    assert_equal "true", user_script.version_warning_dismissed
  end

  test "raises for nonexistent script" do
    user = create :user
    sign_in user
    assert_raises ActiveRecord::RecordNotFound do
      patch :update, params: {script_id: 99, version_warning_dismissed: true}
    end
    user_script = UserScript.find_by(user: user, script: 99)
    assert_nil user_script
  end
end
