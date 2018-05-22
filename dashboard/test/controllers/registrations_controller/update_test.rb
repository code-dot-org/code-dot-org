# -*- coding: utf-8 -*-
require 'test_helper'

module RegistrationsControllerTests
  #
  # Tests over PUT /users
  #
  class UpdateTest < ActionDispatch::IntegrationTest
    setup do
      Honeybadger.expects(:notify).never
    end

    test "update student without user param returns 400 BAD REQUEST" do
      student = create :student
      sign_in student
      assert_does_not_create(User) do
        put '/users', params: {}
      end
      assert_response :bad_request
    end

    test "update student with utf8mb4 in name fails" do
      student = create :student

      sign_in student

      assert_does_not_create(User) do
        put '/users', params: {user: {name: panda_panda}}
      end
      assert_response :success # which actually means an error...
      assert_equal ['Display Name is invalid'], assigns(:user).errors.full_messages
      assert_select 'div#error_explanation', /Display Name is invalid/ # ... is rendered on the page
    end

    test "update student with utf8mb4 in email fails" do
      Honeybadger.expects(:notify).once.with(
        error_class: 'RegistrationsControllerWarning',
        error_message: 'Email updated via deprecated route',
      )

      student = create :student

      sign_in student

      # don't ask the db for existing panda emails
      User.expects(:find_by_email_or_hashed_email).never

      assert_does_not_create(User) do
        put '/users', params: {
          user: {email: "#{panda_panda}@panda.xx", current_password: '00secret'}
        }
      end

      assert_response :success # which actually means an error...
      assert_equal ['Email is invalid'], assigns(:user).errors.full_messages
      assert_select 'div#error_explanation', /Email is invalid/ # ... is rendered on the page
    end

    test "update student with age" do
      Timecop.travel Time.local(2013, 9, 1, 12, 0, 0) do
        student = create :student, birthday: '1981/03/24'

        sign_in student

        put '/users', params: {format: :js, user: {age: 9}}
        assert_response :no_content

        assert_equal Date.today - 9.years, assigns(:user).birthday
      end
    end

    test "update student with age with weird params" do
      # we are getting input that looks like this:
      # "user" => {"age" => {"Pr" => ""}}
      # https://www.honeybadger.io/projects/3240/faults/9963470
      Timecop.travel Time.local(2013, 9, 1, 12, 0, 0) do
        student = create :student, birthday: '1981/03/24'

        sign_in student

        put '/users', params: {format: :js, user: {age: {"Pr" => nil}}}
        assert_response :no_content

        # did not change
        assert_equal '1981-03-24', assigns(:user).birthday.to_s
      end
    end

    test "update student with client side hashed email" do
      Honeybadger.expects(:notify).once.with(
        error_class: 'RegistrationsControllerWarning',
        error_message: 'Email updated via deprecated route',
      )

      student = create :student, birthday: '1981/03/24', password: 'whatev'
      sign_in student

      put '/users', params: {
        user: {
          age: '9',
          email: '',
          hashed_email: User.hash_email('hidden@email.com'),
          current_password: 'whatev' # need this to change email
        }
      }

      assert_redirected_to '/'

      assert_equal '', assigns(:user).email
      assert_equal User.hash_email('hidden@email.com'), assigns(:user).hashed_email
    end

    test "update over 13 student with plaintext email" do
      Honeybadger.expects(:notify).once.with(
        error_class: 'RegistrationsControllerWarning',
        error_message: 'Email updated via deprecated route',
      )

      student = create :student, birthday: '1981/03/24', password: 'whatev'
      sign_in student

      put '/users', params: {
        user: {
          age: '19',
          email: 'hashed@email.com',
          current_password: 'whatev' # need this to change email
        }
      }

      assert_redirected_to '/'

      assert_equal '', assigns(:user).email
      assert_equal User.hash_email('hashed@email.com'), assigns(:user).hashed_email
    end

    test 'update rejects unwanted parameters' do
      user = create :user, name: 'non-admin'
      sign_in user
      put '/users', params: {user: {name: 'admin', admin: true}}

      user.reload
      assert_equal 'admin', user.name
      refute user.admin
    end

    test "converting student to teacher without password succeeds when email hasn't changed" do
      Honeybadger.expects(:notify).once.with(
        error_class: 'RegistrationsControllerWarning',
        error_message: 'User type updated via deprecated route',
      )

      test_email = 'me@example.com'
      student = create :student, email: test_email
      original_hashed_email = student.hashed_email
      assert_empty student.email
      sign_in student

      put '/users', as: :json, params: {
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
    end

    test "converting student to teacher without password fails when email doesn't match" do
      Honeybadger.expects(:notify).once.with(
        error_class: 'RegistrationsControllerWarning',
        error_message: 'User type updated via deprecated route',
      )

      test_email = 'me@example.com'
      student = create :student, email: test_email
      original_hashed_email = student.hashed_email
      assert_empty student.email
      sign_in student

      put '/users', as: :json, params: {
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
    end

    test "converting teacher to student without password succeeds" do
      Honeybadger.expects(:notify).once.with(
        error_class: 'RegistrationsControllerWarning',
        error_message: 'User type updated via deprecated route',
      )

      test_email = 'me@example.com'
      teacher = create :teacher, email: test_email
      original_hashed_email = teacher.hashed_email
      sign_in teacher

      put '/users', as: :json, params: {
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
    end

    # The next several tests explore profile changes for users with or without
    # passwords.  Examples of users without passwords are users that authenticate
    # via oauth (a third-party account), or students with a picture password.

    test "editing password of student-without-password is not allowed" do
      student_without_password = create :student
      student_without_password.update_attribute(:encrypted_password, '')
      assert student_without_password.encrypted_password.blank?

      refute can_edit_password_without_password? student_without_password
      refute can_edit_password_with_password? student_without_password, 'wrongpassword'
      refute can_edit_password_with_password? student_without_password, ''
    end

    test "editing password of student-with-password requires current password" do
      student_with_password = create :student, password: 'oldpassword'
      refute can_edit_password_without_password? student_with_password
      refute can_edit_password_with_password? student_with_password, 'wrongpassword'
      assert can_edit_password_with_password? student_with_password, 'oldpassword'
    end

    test "editing password of teacher-without-password is not allowed" do
      teacher_without_password = create :teacher
      teacher_without_password.update_attribute(:encrypted_password, '')
      assert teacher_without_password.encrypted_password.blank?

      refute can_edit_password_without_password? teacher_without_password
      refute can_edit_password_with_password? teacher_without_password, 'wrongpassword'
      refute can_edit_password_with_password? teacher_without_password, ''
    end

    test "editing password of teacher-with-password requires current password" do
      teacher_with_password = create :teacher, password: 'oldpassword'
      refute can_edit_password_without_password? teacher_with_password
      refute can_edit_password_with_password? teacher_with_password, 'wrongpassword'
      assert can_edit_password_with_password? teacher_with_password, 'oldpassword'
    end

    test "editing email of student-without-password is not allowed" do
      student_without_password = create :student
      student_without_password.update_attribute(:encrypted_password, '')
      assert student_without_password.encrypted_password.blank?

      refute can_edit_email_without_password? student_without_password
      refute can_edit_email_with_password? student_without_password, 'wrongpassword'
      refute can_edit_email_with_password? student_without_password, ''
    end

    test "editing email of student-with-password requires current password" do
      student_with_password = create :student, password: 'oldpassword'
      refute can_edit_email_without_password? student_with_password
      refute can_edit_email_with_password? student_with_password, 'wrongpassword'
      assert can_edit_email_with_password? student_with_password, 'oldpassword'
    end

    test "editing email of teacher-without-password is not allowed" do
      teacher_without_password = create :teacher
      teacher_without_password.update_attribute(:encrypted_password, '')
      assert teacher_without_password.encrypted_password.blank?

      refute can_edit_email_without_password? teacher_without_password
      refute can_edit_email_with_password? teacher_without_password, 'wrongpassword'
      refute can_edit_email_with_password? teacher_without_password, ''
    end

    test "editing email of teacher-with-password requires current password" do
      teacher_with_password = create :teacher, password: 'oldpassword'
      refute can_edit_email_without_password? teacher_with_password
      refute can_edit_email_with_password? teacher_with_password, 'wrongpassword'
      assert can_edit_email_with_password? teacher_with_password, 'oldpassword'
    end

    test "editing hashed_email of student-without-password is not allowed" do
      student_without_password = create :student
      student_without_password.update_attribute(:encrypted_password, '')
      assert student_without_password.encrypted_password.blank?

      refute can_edit_hashed_email_without_password? student_without_password
      refute can_edit_hashed_email_with_password? student_without_password, 'wrongpassword'
      refute can_edit_hashed_email_with_password? student_without_password, ''
    end

    test "editing hashed_email of student-with-password requires current password" do
      student_with_password = create :student, password: 'oldpassword'
      refute can_edit_hashed_email_without_password? student_with_password
      refute can_edit_hashed_email_with_password? student_with_password, 'wrongpassword'
      assert can_edit_hashed_email_with_password? student_with_password, 'oldpassword'
    end

    test "editing hashed_email of teacher-without-password is not allowed" do
      teacher_without_password = create :teacher
      teacher_without_password.update_attribute(:encrypted_password, '')
      assert teacher_without_password.encrypted_password.blank?

      refute can_edit_hashed_email_without_password? teacher_without_password
      refute can_edit_hashed_email_with_password? teacher_without_password, 'wrongpassword'
      refute can_edit_hashed_email_with_password? teacher_without_password, ''
    end

    test "editing hashed_email of teacher-with-password requires current password" do
      teacher_with_password = create :teacher, password: 'oldpassword'
      refute can_edit_hashed_email_without_password? teacher_with_password
      refute can_edit_hashed_email_with_password? teacher_with_password, 'wrongpassword'
      # Can't even do this, because cleartext email is required for teachers
      refute can_edit_hashed_email_with_password? teacher_with_password, 'oldpassword'
    end

    private

    def can_edit_password_without_password?(user)
      new_password = 'newpassword'

      sign_in user
      put '/users', params: {
        user: {
          password: new_password,
          password_confirmation: new_password
        }
      }

      user = user.reload
      user.valid_password? new_password
    end

    def can_edit_password_with_password?(user, current_password)
      new_password = 'newpassword'

      sign_in user
      put '/users', params: {
        user: {
          password: new_password,
          password_confirmation: new_password,
          current_password: current_password
        }
      }

      user = user.reload
      user.valid_password? new_password
    end

    def can_edit_email_without_password?(user)
      Honeybadger.expects(:notify).once.with(
        error_class: 'RegistrationsControllerWarning',
        error_message: 'Email updated via deprecated route',
      )

      new_email = 'new@example.com'

      sign_in user
      put '/users', params: {user: {email: new_email}}

      user = user.reload
      user.email == new_email || user.hashed_email == User.hash_email(new_email)
    end

    def can_edit_email_with_password?(user, current_password)
      Honeybadger.expects(:notify).once.with(
        error_class: 'RegistrationsControllerWarning',
        error_message: 'Email updated via deprecated route',
      )

      new_email = 'new@example.com'

      sign_in user
      put '/users', params: {
        user: {email: new_email, current_password: current_password}
      }

      user = user.reload
      user.email == new_email || user.hashed_email == User.hash_email(new_email)
    end

    def can_edit_hashed_email_without_password?(user)
      Honeybadger.expects(:notify).once.with(
        error_class: 'RegistrationsControllerWarning',
        error_message: 'Email updated via deprecated route',
      )

      new_hashed_email = '729980b94e1439aeed40122476b0f695'

      sign_in user
      put '/users', params: {user: {hashed_email: new_hashed_email}}

      user = user.reload
      user.hashed_email == new_hashed_email
    end

    def can_edit_hashed_email_with_password?(user, current_password)
      Honeybadger.expects(:notify).once.with(
        error_class: 'RegistrationsControllerWarning',
        error_message: 'Email updated via deprecated route',
      )

      new_hashed_email = '729980b94e1439aeed40122476b0f695'

      sign_in user
      put '/users', params: {
        user: {hashed_email: new_hashed_email, current_password: current_password}
      }

      user = user.reload
      user.hashed_email == new_hashed_email
    end
  end
end
