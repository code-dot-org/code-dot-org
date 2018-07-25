# -*- coding: utf-8 -*-
require 'test_helper'

module RegistrationsControllerTests
  #
  # Tests over DELETE /users
  #
  class DestroyTest < ActionDispatch::IntegrationTest
    #
    # Tests for old destroy flow
    #

    test "destroys the user" do
      user = create :user
      sign_in user
      assert_destroys(User) do
        delete '/users'
      end
      assert_redirected_to '/'
    end

    #
    # Tests for new destroy flow
    #

    test "returns bad request if user cannot delete own account" do
      user = create :user
      user.stubs(:can_delete_own_account?).returns(false)
      sign_in user
      assert_does_not_destroy(User) do
        delete '/users', params: {new_destroy_flow: true}
      end
      assert_response :bad_request
    end

    test "returns bad request if password is required and not provided" do
      user = create :user, password: 'password'
      sign_in user
      assert_does_not_destroy(User) do
        delete '/users', params: {new_destroy_flow: true}
      end
      assert_response :bad_request
    end

    test "returns bad request if password is required and incorrect" do
      user = create :user, password: 'password'
      sign_in user
      assert_does_not_destroy(User) do
        delete '/users', params: {new_destroy_flow: true, password_confirmation: 'notmypassword'}
      end
      assert_response :bad_request
    end

    test "destroys the user if password is required and correct" do
      user = create :user, password: 'password'
      sign_in user
      assert_destroys(User) do
        delete '/users', params: {new_destroy_flow: true, password_confirmation: 'password'}
      end
      assert_response :success
    end

    test "destroys the user if password is not required" do
      user = create :user, :with_migrated_google_authentication_option
      user.update_attribute(:encrypted_password, nil)
      sign_in user
      assert_destroys(User) do
        delete '/users', params: {new_destroy_flow: true}
      end
      assert_response :success
    end

    test "sends email when teacher destroyed in new flow" do
      default_params = {
        name: 'A name',
        password: 'apassword',
        email: 'an@email.address',
        gender: 'F',
        age: '21',
        user_type: 'teacher'
      }
      teacher_params = default_params.update(user_type: 'teacher', email_preference_opt_in: 'yes')
      assert_creates(User) do
        post '/users', params: {user: teacher_params}
      end

      user = User.last
      sign_in user
      assert_destroys(User) do
        delete '/users', params: {new_destroy_flow: true, password_confirmation: 'apassword'}
      end

      assert_equal 2, ActionMailer::Base.deliveries.length
      mail = ActionMailer::Base.deliveries.last
      assert_equal I18n.t('teacher_mailer.delete_teacher_subject'), mail.subject
      assert_equal [user.email], mail.to
      assert_equal ['noreply@code.org'], mail.from
      assert_match 'Your account has been deleted', mail.body.encoded
    end
  end
end
