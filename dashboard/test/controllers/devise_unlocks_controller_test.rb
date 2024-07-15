require 'test_helper'

class DeviseUnlocksControllerTest < ActionController::TestCase
  tests Devise::UnlocksController
  include Devise::Test::ControllerHelpers

  test 'locked-out account can be successfully unlocked by token' do
    teacher = create(:teacher)
    teacher.lock_access!

    assert teacher.access_locked?
    token = Devise.token_generator.digest(teacher, :unlock_token, teacher.unlock_token)
    get :show, params: {unlock_token: token}
    refute teacher.reload.access_locked?
  end
end
