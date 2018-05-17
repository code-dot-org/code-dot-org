# -*- coding: utf-8 -*-
require 'test_helper'

#
# Tests over /users/user_type
#
# This route is handled by RegistrationsController but is complex enough to
# merit its own test file.
#
class SetUserTypeTest < ActionController::TestCase
  setup do
    @controller = RegistrationsController.new

    # stub properties so we don't try to hit pegasus db
    Properties.stubs(:get).returns nil

    # This is an AJAX-first route
    request.headers['HTTP_ACCEPT'] = "application/json"
  end

  test "update student without user param returns 400 BAD REQUEST" do
    student = create :student
    sign_in student
    assert_does_not_create(User) do
      post :set_user_type, params: {}
    end
    assert_response :bad_request
  end

  test 'update rejects unwanted parameters' do
    user = create :user, name: 'non-admin'
    sign_in user
    post :set_user_type, params: {user: {admin: true}}

    user.reload
    refute user.admin
  end

  test "converting student to teacher" do
    test_email = 'me@example.com'
    student = create :student, email: test_email
    original_hashed_email = student.hashed_email
    assert_empty student.email
    sign_in student

    request.headers['HTTP_ACCEPT'] = "application/json"
    post :set_user_type, params: {
      user: {
        user_type: 'teacher',
        email: test_email,
        hashed_email: student.hashed_email
      }
    }
    assert_response :success

    student.reload
    assert_equal 'teacher', student.user_type
    assert_equal test_email, student.email
    assert_equal original_hashed_email, student.hashed_email

    refute EmailPreference.find_by_email(test_email)
  end

  test "converting student to teacher with positive email opt-in" do
    test_email = 'me@example.com'
    student = create :student, email: test_email
    sign_in student

    request.headers['HTTP_ACCEPT'] = "application/json"
    post :set_user_type, params: {
      user: {
        user_type: 'teacher',
        email: test_email,
        hashed_email: student.hashed_email,
        email_opt_in: 'yes'
      }
    }
    assert_response :success

    preference = EmailPreference.find_by_email(test_email)
    refute_nil preference
    assert_equal true, preference.opt_in
    assert_equal request.env['REMOTE_ADDR'], preference.ip_address
    assert_equal EmailPreference::ACCOUNT_TYPE_CHANGE, preference.source
    assert_equal "0", preference.form_kind
  end

  test "converting student to teacher with negative email opt-in" do
    test_email = 'me@example.com'
    student = create :student, email: test_email
    sign_in student

    request.headers['HTTP_ACCEPT'] = "application/json"
    post :set_user_type, params: {
      user: {
        user_type: 'teacher',
        email: test_email,
        hashed_email: student.hashed_email,
        email_opt_in: 'no'
      }
    }
    assert_response :success

    student.reload
    assert_equal 'teacher', student.user_type
    assert_equal test_email, student.email

    preference = EmailPreference.find_by_email(test_email)
    refute_nil preference
    assert_equal false, preference.opt_in
    assert_equal request.env['REMOTE_ADDR'], preference.ip_address
    assert_equal EmailPreference::ACCOUNT_TYPE_CHANGE, preference.source
    assert_equal "0", preference.form_kind
  end

  test "converting student to teacher fails when email doesn't match" do
    test_email = 'me@example.com'
    student = create :student, email: test_email
    original_hashed_email = student.hashed_email
    sign_in student

    request.headers['HTTP_ACCEPT'] = "application/json"
    post :set_user_type, params: {
      user: {
        user_type: 'teacher',
        email: 'wrong_email@example.com',
        hashed_email: student.hashed_email
      }
    }
    assert_response :unprocessable_entity

    student.reload
    assert_equal 'student', student.user_type
    assert_empty student.email
    assert_equal original_hashed_email, student.hashed_email

    refute EmailPreference.find_by_email(test_email)
  end

  test "converting student to teacher doesn't cause email opt-in when email doesn't match" do
    test_email = 'me@example.com'
    student = create :student, email: test_email
    sign_in student

    request.headers['HTTP_ACCEPT'] = "application/json"
    post :set_user_type, params: {
      user: {
        user_type: 'teacher',
        email: 'wrong_email@example.com',
        hashed_email: student.hashed_email,
        email_opt_in: 'yes'
      }
    }
    assert_response :unprocessable_entity

    refute EmailPreference.find_by_email(test_email)
  end

  test "converting teacher to student without password succeeds" do
    test_email = 'me@example.com'
    teacher = create :teacher, email: test_email
    original_hashed_email = teacher.hashed_email
    sign_in teacher

    request.headers['HTTP_ACCEPT'] = "application/json"
    post :set_user_type, params: {
      user: {
        user_type: 'student',
        email: '',
        hashed_email: teacher.hashed_email
      }
    }
    assert_response :success

    teacher.reload
    assert_equal 'student', teacher.user_type
    assert_empty teacher.email
    assert_equal original_hashed_email, teacher.hashed_email

    refute EmailPreference.find_by_email(test_email)
  end

  test "converting teacher to student ignores email opt-in" do
    test_email = 'me@example.com'
    teacher = create :teacher, email: test_email
    sign_in teacher

    request.headers['HTTP_ACCEPT'] = "application/json"
    post :set_user_type, params: {
      user: {
        user_type: 'student',
        email: '',
        hashed_email: teacher.hashed_email,
        email_opt_in: 'yes'
      }
    }
    assert_response :success

    refute EmailPreference.find_by_email(test_email)
  end
end
