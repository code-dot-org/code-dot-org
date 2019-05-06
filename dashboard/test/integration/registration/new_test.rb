require 'test_helper'

module RegistrationsControllerTests
  #
  # Tests over GET /users/sign_up
  #
  class NewTest < ActionDispatch::IntegrationTest
    #
    # OLD SIGNUP FLOW
    #
    test 'renders old signup form in old flow' do
      SignUpTracking.stubs(:new_sign_up_experience?).returns(false)
      PartialRegistration.stubs(:in_progress?).returns(false)

      get '/users/sign_up'
      assert_response :success
      assert_template partial: '_sign_up'
      assert_template partial: '_old_sign_up_form'
    end

    test 'renders finish signup form in old flow if partial registration is in progress' do
      SignUpTracking.stubs(:new_sign_up_experience?).returns(false)
      PartialRegistration.stubs(:in_progress?).returns(true)
      user = build :student, provider: 'facebook', email: 'email@facebook.xx'
      User.expects(:new_with_session).returns(user)

      get '/users/sign_up'

      assert_response :success
      assert_template partial: '_finish_sign_up'
      assert_equal 'email@facebook.xx', assigns(:user).email
      assert_nil assigns(:user).username
      assert_empty assigns(:user).errors.full_messages
    end

    #
    # NEW SIGNUP FLOW
    #
    test 'renders new signup form if partial registration is not in progress in new flow' do
      SignUpTracking.stubs(:new_sign_up_experience?).returns(true)
      SignUpTracking.expects(:begin_sign_up_tracking)

      get '/users/sign_up'
      assert_response :success
      assert_template partial: '_sign_up'
      assert_template partial: '_new_sign_up_form'
    end

    # Note: The analogous test for the old signup flow is in registrations_controller_test.rb because
    # it requires access to the session, which ActionDispatch::IntegrationTest does not provide
    test "signup does not display errors on pageload in new flow" do
      SignUpTracking.stubs(:new_sign_up_experience?).returns(true)
      PartialRegistration.stubs(:in_progress?).returns(true)
      user = build :student, provider: 'facebook', email: 'email@facebook.xx'
      User.expects(:new_with_session).returns(user)

      get '/users/sign_up'

      assert_equal 'email@facebook.xx', assigns(:user).email
      assert_nil assigns(:user).username
      assert_empty assigns(:user).errors.full_messages
    end

    test 'renders finish_sign_up partial registration is in progress in new flow' do
      SignUpTracking.stubs(:new_sign_up_experience?).returns(true)
      PartialRegistration.stubs(:in_progress?).returns(true)
      User.expects(:new_with_session).returns(build(:user))

      get '/users/sign_up'
      assert_response :success
      assert_template partial: '_finish_sign_up'
    end
  end
end
