require 'test_helper'

module RegistrationsControllerTests
  #
  # Tests over GET /users/sign_up
  #
  class NewTest < ActionDispatch::IntegrationTest
    test 'renders finish_sign_up if partial registration is in progress' do
      PartialRegistration.expects(:in_progress?).returns(true).twice
      User.expects(:new_with_session).returns(build(:user))

      get '/users/sign_up'
      assert_response :success
      assert_template partial: '_finish_sign_up'
    end

    test 'renders sign_up if partial registration is not in progress' do
      SignUpTracking.expects(:begin_sign_up_tracking)
      FirehoseClient.instance.expects(:put_record)

      get '/users/sign_up'
      assert_response :success
      assert_template partial: '_sign_up'
    end
  end
end
