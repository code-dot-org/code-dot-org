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
  end
end
