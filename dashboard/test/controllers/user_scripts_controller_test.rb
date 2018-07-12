require 'test_helper'

class UserScriptsControllerTest < ActionController::TestCase
  test "student can dismiss version warning" do
    user_script = create :user_script
    sign_in user_script.user
    patch :update, params: {id: user_script.id, version_warning_dismissed: true}
    assert_response :success
    user_script.reload
    assert_equal "true", user_script.version_warning_dismissed
  end
end
