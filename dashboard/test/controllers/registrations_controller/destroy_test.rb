# -*- coding: utf-8 -*-
require 'test_helper'

module RegistrationsControllerTests
  #
  # Tests over DELETE /users
  #
  class DestroyTest < ActionDispatch::IntegrationTest
    setup do
      @password = 'mypassword'

      @teacher = create :teacher, password: @password
      @section = create :section, user: @teacher

      @word_section_teacher = create :teacher, password: @password
      word_section = create :section, user: @word_section_teacher, login_type: Section::LOGIN_TYPE_WORD
      @word_section_student = create :student, encrypted_password: nil, provider: 'sponsored'
      create(:follower, student_user: @word_section_student, section: word_section)
    end

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

    test "destroys teacher and dependent students" do
      sign_in @word_section_teacher

      assert_difference('User.count', -2) do
        delete '/users', params: {new_destroy_flow: true, password_confirmation: @password}
      end
      assert_response :success
      assert_raises(ActiveRecord::RecordNotFound) {User.find(@word_section_student.id)}
      assert_raises(ActiveRecord::RecordNotFound) {User.find(@word_section_teacher.id)}
    end

    test "destroying teacher does not destroy another teacher in their section" do
      another_teacher = create :teacher
      @section.students << another_teacher
      sign_in @teacher

      assert_destroys(User) do
        delete '/users', params: {new_destroy_flow: true, password_confirmation: 'mypassword'}
      end
      assert_response :success
      assert_raises(ActiveRecord::RecordNotFound) {User.find(@teacher.id)}
      refute_nil User.find(another_teacher.id)
    end

    test "destroying teacher does not destroy student with personal login" do
      student = create(:follower, section: @section).student_user
      sign_in @teacher

      assert_destroys(User) do
        delete '/users', params: {new_destroy_flow: true, password_confirmation: 'mypassword'}
      end
      assert_response :success
      assert_raises(ActiveRecord::RecordNotFound) {User.find(@teacher.id)}
      refute_nil User.find(student.id)
    end

    test "destroying teacher does not destroy student in another section" do
      another_section = create :section
      another_section.students << @word_section_student
      sign_in @word_section_teacher

      assert_destroys(User) do
        delete '/users', params: {new_destroy_flow: true, password_confirmation: @password}
      end
      assert_response :success
      assert_raises(ActiveRecord::RecordNotFound) {User.find(@word_section_teacher.id)}
      refute_nil User.find(@word_section_student.id)
    end

    test "destroying student does not destroy any other accounts" do
      student = create :student, password: 'mypassword'
      sign_in student

      assert_destroys(User) do
        delete '/users', params: {new_destroy_flow: true, password_confirmation: 'mypassword'}
      end
      assert_response :success
      assert_raises(ActiveRecord::RecordNotFound) {User.find(student.id)}
    end
  end
end
