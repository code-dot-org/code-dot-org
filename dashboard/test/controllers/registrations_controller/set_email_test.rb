# -*- coding: utf-8 -*-
require 'test_helper'

module RegistrationsControllerTests
  #
  # Tests over PATCH /users/email
  #
  class SetEmailTest < ActionDispatch::IntegrationTest
    test "set email without user param returns 400 BAD REQUEST" do
      student = create :student
      sign_in student
      assert_does_not_create(User) do
        patch '/users/email', as: :json, params: {}
      end
      assert_response :bad_request
    end

    test "set email with utf8mb4 in email fails" do
      student = create :student
      sign_in student

      # don't ask the db for existing panda emails
      User.expects(:find_by_email_or_hashed_email).never

      assert_does_not_create(User) do
        patch '/users/email', as: :json, params: {
          user: {email: "#{panda_panda}@panda.xx", current_password: '00secret'}
        }
      end

      assert_response :unprocessable_entity
      assert_equal ['Email is invalid'], assigns(:user).errors.full_messages
      assert_equal response.body, {email: ['Email is invalid']}.to_json
    end

    test "update student with client side hashed email" do
      student = create :student, birthday: '1981/03/24', password: 'whatev'
      sign_in student

      patch '/users/email', as: :json, params: {
        user: {
          email: '',
          hashed_email: User.hash_email('hidden@email.com'),
          current_password: 'whatev' # need this to change email
        }
      }

      assert_response :success
      assert_equal '', assigns(:user).email
      assert_equal User.hash_email('hidden@email.com'), assigns(:user).hashed_email
    end

    test "update over 13 student with plaintext email" do
      student = create :student, birthday: '1981/03/24', password: 'whatev'
      sign_in student

      patch '/users/email', as: :json, params: {
        user: {
          email: 'hashed@email.com',
          current_password: 'whatev' # need this to change email
        }
      }

      assert_response :success
      assert_equal '', assigns(:user).email
      assert_equal User.hash_email('hashed@email.com'), assigns(:user).hashed_email
    end

    test 'update rejects unwanted parameters' do
      user = create :user, name: 'non-admin'
      sign_in user
      patch '/users/email', as: :json, params: {user: {admin: true}}
      assert_response :success

      user.reload
      refute user.admin
    end

    # The next several tests explore email changes for users with or without
    # passwords.  Examples of users without passwords are users that authenticate
    # via oauth (a third-party account), or students with a picture password.

    test "editing email of student-without-password is not allowed" do
      student_without_password = create :student
      student_without_password.update_attribute(:encrypted_password, '')
      assert student_without_password.encrypted_password.blank?

      refute can_edit_email_without_password student_without_password
      refute can_edit_email_with_password student_without_password, 'wrongpassword'
      refute can_edit_email_with_password student_without_password, ''
    end

    test "editing email of student-with-password requires current password" do
      student_with_password = create :student, password: 'oldpassword'
      refute can_edit_email_without_password student_with_password
      refute can_edit_email_with_password student_with_password, 'wrongpassword'
      assert can_edit_email_with_password student_with_password, 'oldpassword'
    end

    test "editing email of teacher-without-password is not allowed" do
      teacher_without_password = create :teacher
      teacher_without_password.update_attribute(:encrypted_password, '')
      assert teacher_without_password.encrypted_password.blank?

      refute can_edit_email_without_password teacher_without_password
      refute can_edit_email_with_password teacher_without_password, 'wrongpassword'
      refute can_edit_email_with_password teacher_without_password, ''
    end

    test "editing email of teacher-with-password requires current password" do
      teacher_with_password = create :teacher, password: 'oldpassword'
      refute can_edit_email_without_password teacher_with_password
      refute can_edit_email_with_password teacher_with_password, 'wrongpassword'
      assert can_edit_email_with_password teacher_with_password, 'oldpassword'
    end

    test "editing hashed_email of student-without-password is not allowed" do
      student_without_password = create :student
      student_without_password.update_attribute(:encrypted_password, '')
      assert student_without_password.encrypted_password.blank?

      refute can_edit_hashed_email_without_password student_without_password
      refute can_edit_hashed_email_with_password student_without_password, 'wrongpassword'
      refute can_edit_hashed_email_with_password student_without_password, ''
    end

    test "editing hashed_email of student-with-password requires current password" do
      student_with_password = create :student, password: 'oldpassword'
      refute can_edit_hashed_email_without_password student_with_password
      refute can_edit_hashed_email_with_password student_with_password, 'wrongpassword'
      assert can_edit_hashed_email_with_password student_with_password, 'oldpassword'
    end

    test "editing hashed_email of teacher-without-password is not allowed" do
      teacher_without_password = create :teacher
      teacher_without_password.update_attribute(:encrypted_password, '')
      assert teacher_without_password.encrypted_password.blank?

      refute can_edit_hashed_email_without_password teacher_without_password
      refute can_edit_hashed_email_with_password teacher_without_password, 'wrongpassword'
      refute can_edit_hashed_email_with_password teacher_without_password, ''
    end

    test "editing hashed_email of teacher-with-password requires current password" do
      teacher_with_password = create :teacher, password: 'oldpassword'
      refute can_edit_hashed_email_without_password teacher_with_password
      refute can_edit_hashed_email_with_password teacher_with_password, 'wrongpassword'
      # Can't even do this, because cleartext email is required for teachers
      refute can_edit_hashed_email_with_password teacher_with_password, 'oldpassword'
    end

    test "updating teacher email with positive email opt-in" do
      new_email = 'new_email@example.com'
      teacher = create :teacher, password: 'password'
      sign_in teacher
      patch '/users/email', as: :json, params: {
        user: {
          email: new_email,
          current_password: 'password',
          email_preference_opt_in: 'yes',
        }
      }
      assert_response :success

      preference = EmailPreference.find_by_email(new_email)
      refute_nil preference
      assert_equal true, preference.opt_in
      assert_equal request.ip, preference.ip_address
      assert_equal EmailPreference::ACCOUNT_EMAIL_CHANGE, preference.source
      assert_equal "0", preference.form_kind
    end

    test "updating teacher email with negative email opt-in" do
      new_email = 'new_email@example.com'
      teacher = create :teacher, password: 'password'
      sign_in teacher
      patch '/users/email', as: :json, params: {
        user: {
          email: new_email,
          current_password: 'password',
          email_preference_opt_in: 'no',
        }
      }
      assert_response :success

      preference = EmailPreference.find_by_email(new_email)
      refute_nil preference
      assert_equal false, preference.opt_in
      assert_equal request.ip, preference.ip_address
      assert_equal EmailPreference::ACCOUNT_EMAIL_CHANGE, preference.source
      assert_equal "0", preference.form_kind
    end

    test "updating teacher email skips email opt-in when update fails" do
      new_email = 'new_email@example.com'
      teacher = create :teacher
      sign_in teacher
      patch '/users/email', as: :json, params: {
        user: {
          email: new_email,
          email_preference_opt_in: 'yes'
        }
      }
      assert_response :unprocessable_entity

      refute EmailPreference.find_by_email(new_email)
    end

    test "updating student email ignores email opt-in" do
      new_email = 'new_email@example.com'
      student = create :student
      sign_in student
      patch '/users/email', as: :json, params: {
        user: {
          email: new_email,
          email_preference_opt_in: 'yes'
        }
      }
      assert_response :unprocessable_entity

      refute EmailPreference.find_by_email(new_email)
    end

    private

    def can_edit_password_with_password(user, current_password)
      new_password = 'newpassword'

      sign_in user
      patch '/users/email', as: :json, params: {
        user: {
          password: new_password,
          password_confirmation: new_password,
          current_password: current_password
        }
      }

      user = user.reload
      user.valid_password? new_password
    end

    def can_edit_email_without_password(user)
      new_email = 'new@example.com'

      sign_in user
      patch '/users/email', as: :json, params: {user: {email: new_email}}

      user = user.reload
      user.email == new_email || user.hashed_email == User.hash_email(new_email)
    end

    def can_edit_email_with_password(user, current_password)
      new_email = 'new@example.com'

      sign_in user
      patch '/users/email', as: :json, params: {
        user: {email: new_email, current_password: current_password}
      }

      user = user.reload
      user.email == new_email || user.hashed_email == User.hash_email(new_email)
    end

    def can_edit_hashed_email_without_password(user)
      new_hashed_email = '729980b94e1439aeed40122476b0f695'

      sign_in user
      patch '/users/email', as: :json, params: {user: {hashed_email: new_hashed_email}}

      user = user.reload
      user.hashed_email == new_hashed_email
    end

    def can_edit_hashed_email_with_password(user, current_password)
      new_hashed_email = '729980b94e1439aeed40122476b0f695'

      sign_in user
      patch '/users/email', as: :json, params: {
        user: {hashed_email: new_hashed_email, current_password: current_password}
      }

      user = user.reload
      user.hashed_email == new_hashed_email
    end
  end
end
