require 'test_helper'

module RegistrationsControllerTests
  #
  # Tests over PATCH /users/user_type
  #
  class SetUserTypeTest < ActionDispatch::IntegrationTest
    test "update user type without user param returns 400 BAD REQUEST" do
      student = create :student
      sign_in student
      assert_does_not_create(User) do
        patch '/users/user_type', as: :json, params: {}
      end
      assert_response :bad_request
    end

    test "update user type without user_type param returns 400 BAD REQUEST" do
      student = create :student
      sign_in student
      assert_does_not_create(User) do
        patch '/users/user_type', as: :json, params: {user: {}}
      end
      assert_response :bad_request
    end

    #
    # Tests for non-migrated users
    #
    test 'update rejects unwanted parameters' do
      user = create :teacher, name: 'non-admin'
      sign_in user
      patch '/users/user_type', as: :json, params: {user: {user_type: 'student', admin: true}}
      assert_response :success

      user.reload
      assert user.student?
      refute user.admin?
    end

    test "converting student to teacher" do
      test_email = 'me@example.com'
      student = create :student, email: test_email
      original_hashed_email = student.hashed_email
      assert_empty student.email
      sign_in student

      patch '/users/user_type', as: :json, params: {
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

      patch '/users/user_type', as: :json, params: {
        user: {
          user_type: 'teacher',
          email: test_email,
          hashed_email: student.hashed_email,
          email_preference_opt_in: 'yes'
        }
      }
      assert_response :success

      preference = EmailPreference.find_by_email(test_email)
      refute_nil preference
      assert_equal true, preference.opt_in
      assert_equal request.ip, preference.ip_address
      assert_equal EmailPreference::ACCOUNT_TYPE_CHANGE, preference.source
      assert_equal "0", preference.form_kind
    end

    test "converting student to teacher with negative email opt-in" do
      test_email = 'me@example.com'
      student = create :student, email: test_email
      sign_in student

      patch '/users/user_type', as: :json, params: {
        user: {
          user_type: 'teacher',
          email: test_email,
          hashed_email: student.hashed_email,
          email_preference_opt_in: 'no'
        }
      }
      assert_response :success

      student.reload
      assert_equal 'teacher', student.user_type
      assert_equal test_email, student.email

      preference = EmailPreference.find_by_email(test_email)
      refute_nil preference
      assert_equal false, preference.opt_in
      assert_equal request.ip, preference.ip_address
      assert_equal EmailPreference::ACCOUNT_TYPE_CHANGE, preference.source
      assert_equal "0", preference.form_kind
    end

    test "converting student to teacher fails when email doesn't match" do
      test_email = 'me@example.com'
      student = create :student, email: test_email
      original_hashed_email = student.hashed_email
      sign_in student

      patch '/users/user_type', as: :json, params: {
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

      patch '/users/user_type', as: :json, params: {
        user: {
          user_type: 'teacher',
          email: 'wrong_email@example.com',
          hashed_email: student.hashed_email,
          email_preference_opt_in: 'yes'
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

      patch '/users/user_type', as: :json, params: {
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

      patch '/users/user_type', as: :json, params: {
        user: {
          user_type: 'student',
          email: '',
          hashed_email: teacher.hashed_email,
          email_preference_opt_in: 'yes'
        }
      }
      assert_response :success

      refute EmailPreference.find_by_email(test_email)
    end

    #
    # Tests for migrated users
    #
    test "converting migrated student to teacher" do
      test_email = 'example@email.com'
      student = create :student, :multi_auth_migrated
      create :authentication_option, user: student, email: test_email
      original_hashed_email = student.hashed_email
      assert_empty student.email
      sign_in student

      patch '/users/user_type', as: :json, params: {
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

    test "converting migrated student to teacher with positive email opt-in" do
      test_email = 'example@email.com'
      student = create :student, :multi_auth_migrated
      create :authentication_option, user: student, email: test_email
      sign_in student

      patch '/users/user_type', as: :json, params: {
        user: {
          user_type: 'teacher',
          email: test_email,
          hashed_email: student.hashed_email,
          email_preference_opt_in: 'yes'
        }
      }
      assert_response :success

      preference = EmailPreference.find_by_email(test_email)
      refute_nil preference
      assert_equal true, preference.opt_in
      assert_equal request.ip, preference.ip_address
      assert_equal EmailPreference::ACCOUNT_TYPE_CHANGE, preference.source
      assert_equal "0", preference.form_kind
    end

    test "converting migrated student to teacher with negative email opt-in" do
      test_email = 'example@email.com'
      student = create :student, :multi_auth_migrated
      create :authentication_option, user: student, email: test_email
      sign_in student

      patch '/users/user_type', as: :json, params: {
        user: {
          user_type: 'teacher',
          email: test_email,
          hashed_email: student.hashed_email,
          email_preference_opt_in: 'no'
        }
      }
      assert_response :success

      student.reload
      assert_equal 'teacher', student.user_type
      assert_equal test_email, student.email

      preference = EmailPreference.find_by_email(test_email)
      refute_nil preference
      assert_equal false, preference.opt_in
      assert_equal request.ip, preference.ip_address
      assert_equal EmailPreference::ACCOUNT_TYPE_CHANGE, preference.source
      assert_equal "0", preference.form_kind
    end

    test "converting migrated student to teacher succeeds when given new email" do
      new_email = 'new_email@example.com'
      student = create :student, :multi_auth_migrated
      create :authentication_option, user: student, email: 'example@email.com'
      sign_in student

      patch '/users/user_type', as: :json, params: {
        user: {
          user_type: 'teacher',
          email: new_email,
          email_preference_opt_in: 'yes'
        }
      }
      assert_response :success

      student.reload
      assert_equal 'teacher', student.user_type
      assert_equal new_email, student.email

      preference = EmailPreference.find_by_email(new_email)
      refute_nil preference
      assert preference.opt_in
      assert_equal request.ip, preference.ip_address
      assert_equal EmailPreference::ACCOUNT_TYPE_CHANGE, preference.source
      assert_equal "0", preference.form_kind
    end

    test "converting migrated student to teacher doesn't cause email opt-in when email isn't provided" do
      test_email = 'example@email.com'
      student = create :student, :multi_auth_migrated
      create :authentication_option, user: student, email: test_email
      sign_in student

      patch '/users/user_type', as: :json, params: {
        user: {
          user_type: 'teacher',
          email: '',
          hashed_email: student.hashed_email,
          email_preference_opt_in: 'yes'
        }
      }
      assert_response :unprocessable_entity

      refute EmailPreference.find_by_email(test_email)
    end

    test "converting migrated teacher to student succeeds" do
      test_email = 'example@email.com'
      teacher = create :teacher, :multi_auth_migrated
      teacher.authentication_options << create(:authentication_option, user: teacher, email: test_email)
      original_hashed_email = teacher.hashed_email
      sign_in teacher

      patch '/users/user_type', as: :json, params: {
        user: {
          user_type: 'student',
          email: '',
          hashed_email: teacher.hashed_email
        }
      }
      assert_response :success

      teacher.reload
      teacher.authentication_options.reload
      assert_equal 'student', teacher.user_type
      assert_empty teacher.email
      assert_equal original_hashed_email, teacher.hashed_email

      refute EmailPreference.find_by_email(test_email)
    end

    test "converting migrated teacher to student ignores email opt-in" do
      test_email = 'example@email.com'
      teacher = create :teacher, :multi_auth_migrated
      teacher.authentication_options << create(:authentication_option, user: teacher, email: test_email)
      sign_in teacher

      patch '/users/user_type', as: :json, params: {
        user: {
          user_type: 'student',
          email: '',
          hashed_email: teacher.hashed_email,
          email_preference_opt_in: 'yes'
        }
      }
      assert_response :success

      refute EmailPreference.find_by_email(test_email)
    end
  end
end
