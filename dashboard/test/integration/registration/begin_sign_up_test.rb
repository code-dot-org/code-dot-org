require 'test_helper'

module RegistrationsControllerTests
  #
  # Tests over POST /users/begin_sign_up
  #
  class BeginSignupTest < ActionDispatch::IntegrationTest
    setup do
      SignUpTracking.stubs(:new_sign_up_experience?).returns(true)
    end

    test 'persists user attributes on success' do
      SignUpTracking.expects(:log_begin_sign_up)
      PartialRegistration.expects(:persist_attributes)

      params = {
        user: {
          email: 'myemail@example.com',
          password: 'mypassword',
          password_confirmation: 'mypassword'
        }
      }
      post '/users/begin_sign_up', params: params

      assert_redirected_to new_user_registration_path
    end

    test 'persists user attributes on success - POST flow' do
      SignUpTracking.expects(:log_begin_sign_up)
      PartialRegistration.expects(:persist_attributes)
      Cpa.stubs(:cpa_experience).with(any_parameters).returns(false)
      DCDO.stubs(:get).with('student-email-post-enabled', false).returns(true)
      DCDO.stubs(:get).with(I18nStringUrlTracker::I18N_STRING_TRACKING_DCDO_KEY, false).returns(false)

      params = {
        user: {
          email: 'myemail@example.com',
          password: 'mypassword',
          password_confirmation: 'mypassword'
        }
      }
      post '/users/begin_sign_up', params: params

      assert_template 'new'
    end

    test 'renders signup page with error if email is empty' do
      SignUpTracking.expects(:log_begin_sign_up)
      PartialRegistration.expects(:persist_attributes).never

      params = {
        user: {
          email: '',
          password: 'mypassword',
          password_confirmation: 'mypassword'
        }
      }
      post '/users/begin_sign_up', params: params

      assert_template 'new'
      assert_select 'p.error', 'is required'
    end

    test 'renders signup page with error if email is already in use' do
      email = 'myemail@example.com'
      SignUpTracking.expects(:log_begin_sign_up)
      PartialRegistration.expects(:persist_attributes).never

      create :user, email: email
      params = {
        user: {
          email: email,
          password: 'mypassword',
          password_confirmation: 'mypassword'
        }
      }
      post '/users/begin_sign_up', params: params

      assert_template 'new'
      assert_select 'p.error', 'has already been taken'
    end

    test 'renders signup page with error if password is empty' do
      SignUpTracking.expects(:log_begin_sign_up)
      PartialRegistration.expects(:persist_attributes).never

      params = {
        user: {
          email: 'myemail@example.com',
          password: '',
          password_confirmation: 'mypassword'
        }
      }
      post '/users/begin_sign_up', params: params

      assert_template 'new'
      assert_select 'p.error', 'is required'
    end

    test 'renders signup page with error if password confirmation is empty' do
      SignUpTracking.expects(:log_begin_sign_up)
      PartialRegistration.expects(:persist_attributes).never

      params = {
        user: {
          email: 'myemail@example.com',
          password: 'mypassword',
          password_confirmation: ''
        }
      }
      post '/users/begin_sign_up', params: params

      assert_template 'new'
      assert_select 'p.error', 'doesn\'t match Password'
    end

    test 'renders signup page with error if passwords do not match' do
      SignUpTracking.expects(:log_begin_sign_up)
      PartialRegistration.expects(:persist_attributes).never

      params = {
        user: {
          email: 'myemail@example.com',
          password: 'mypassword',
          password_confirmation: 'notmypassword'
        }
      }
      post '/users/begin_sign_up', params: params

      assert_template 'new'
      assert_select 'p.error', 'doesn\'t match Password'
    end

    test 'renders signup page with error if passwords are too short' do
      SignUpTracking.expects(:log_begin_sign_up)
      PartialRegistration.expects(:persist_attributes).never

      params = {
        user: {
          email: 'myemail@example.com',
          password: 'pass',
          password_confirmation: 'pass'
        }
      }
      post '/users/begin_sign_up', params: params

      assert_template 'new'
      assert_select 'p.error', 'is too short (minimum is 6 characters)'
    end
  end
end
