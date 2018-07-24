# -*- coding: utf-8 -*-
require 'test_helper'

module RegistrationsControllerTests
  #
  # Tests over GET /users/to_destroy
  #
  class UsersToDestroyTest < ActionDispatch::IntegrationTest
    test "returns bad request if user not signed in" do
      get '/users/to_destroy'
      assert_response :bad_request
    end

    test "returns bad request if user cannot delete own account" do
      user = create :user
      user.stubs(:can_delete_own_account?).returns(false)
      sign_in user

      get '/users/to_destroy'
      assert_response :bad_request
    end

    #
    # Tests for student users
    #

    test "returns name and id of student to be deleted" do
      student = create :student
      expected_user = {"id" => student.id, "name" => student.name}
      sign_in student

      get '/users/to_destroy'
      assert_response :success
      returned_users = JSON.parse(@response.body)
      assert_equal [expected_user], returned_users
    end

    #
    # Tests for teacher users
    #

    test "does not return other teachers" do
      section = create :section
      another_teacher = create :teacher
      section.students << another_teacher

      expected_user = {"id" => section.teacher.id, "name" => section.teacher.name}
      sign_in section.teacher

      get '/users/to_destroy'
      assert_response :success
      returned_users = JSON.parse(@response.body)
      assert_equal [expected_user], returned_users
    end

    test "does not return students with personal logins" do
      section = create :section
      create(:follower, section: section)

      expected_user = {"id" => section.teacher.id, "name" => section.teacher.name}
      sign_in section.teacher

      get '/users/to_destroy'
      assert_response :success
      returned_users = JSON.parse(@response.body)
      assert_equal [expected_user], returned_users
    end

    test "does not return students without personal logins that have other teachers" do
      student = create :student_in_word_section
      teacher = student.teachers.first
      another_section = create :section
      another_section.students << student

      expected_user = {"id" => teacher.id, "name" => teacher.name}
      sign_in teacher

      get '/users/to_destroy'
      assert_response :success
      returned_users = JSON.parse(@response.body)
      assert_equal [expected_user], returned_users
    end

    test "returns students without personal logins that have no other teachers" do
      student = create :student_in_word_section
      teacher = student.teachers.first

      expected_users = [
        {"id" => student.id, "name" => student.name},
        {"id" => teacher.id, "name" => teacher.name}
      ]
      sign_in teacher

      get '/users/to_destroy'
      assert_response :success
      returned_users = JSON.parse(@response.body)
      assert_equal expected_users, returned_users
    end
  end
end
