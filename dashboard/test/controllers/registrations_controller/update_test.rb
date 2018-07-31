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

    test 'update rejects unwanted parameters' do
      user = create :user, name: 'non-admin'
      sign_in user
      put '/users', params: {user: {name: 'admin', admin: true}}

      user.reload
      assert_equal 'admin', user.name
      refute user.admin
    end

    test "converting student to teacher is not allowed" do
      test_email = 'me@example.com'
      student = create :student, email: test_email
      sign_in student

      put '/users', as: :json, params: {
        user: {
          user_type: 'teacher',
          email: test_email,
          hashed_email: student.hashed_email
        }
      }
      assert_response :bad_request

      student.reload
      assert_equal 'student', student.user_type
    end

    test "converting teacher to student is not allowed" do
      test_email = 'me@example.com'
      teacher = create :teacher, email: test_email
      sign_in teacher

      put '/users', as: :json, params: {
        user: {
          user_type: 'student',
          email: '',
          hashed_email: teacher.hashed_email
        }
      }
      assert_response :bad_request

      teacher.reload
      assert_equal 'teacher', teacher.user_type
    end

    test "editing email is not allowed" do
      current_password = 'oldpassword'
      user = create :teacher, password: current_password

      new_email = 'new@example.com'

      sign_in user
      put '/users', params: {
        user: {email: new_email, current_password: current_password}
      }
      assert_response :bad_request

      user = user.reload
      refute user.email == new_email || user.hashed_email == User.hash_email(new_email)
    end

    test "editing hashed_email is not allowed" do
      current_password = 'oldpassword'
      user = create :student, password: current_password

      new_hashed_email = '729980b94e1439aeed40122476b0f695'

      sign_in user
      put '/users', params: {
        user: {hashed_email: new_hashed_email, current_password: current_password}
      }
      assert_response :bad_request

      user = user.reload
      refute user.hashed_email == new_hashed_email
    end

    test "single-auth student without a password can set parent_email without a password" do
      # so it's possible to add a recovery option to their account.  Once they are
      # on multi-auth they can just add an email or another SSO, so this is no
      # longer needed.
      student = create :student, :unmigrated_clever_sso
      assert_nil student.parent_email
      assert_nil student.encrypted_password

      sign_in student
      put '/users', params: {
        format: 'json',
        user: {parent_email: 'parent@example.com'}
      }
      assert_response :no_content

      student.reload
      assert_equal 'parent@example.com', student.parent_email
    end

    test "single-auth student with a password can set parent_email with a password" do
      # so it's possible to add a recovery option to their account.  Once they are
      # on multi-auth they can just add an email or another SSO, so this is no
      # longer needed.
      password = 'drowssap'
      student = create :student, password: password
      assert_nil student.parent_email
      refute_nil student.encrypted_password

      sign_in student
      put '/users', params: {
        format: 'json',
        user: {
          parent_email: 'parent@example.com',
          current_password: password
        }
      }
      assert_response :no_content

      student.reload
      assert_equal 'parent@example.com', student.parent_email
    end

    test "single-auth student with a password cannot set parent_email without a password" do
      # so it's possible to add a recovery option to their account.  Once they are
      # on multi-auth they can just add an email or another SSO, so this is no
      # longer needed.
      student = create :student, password: 'drowssap'
      assert_nil student.parent_email
      refute_nil student.encrypted_password

      sign_in student
      put '/users', params: {
        format: 'json',
        user: {parent_email: 'parent@example.com'}
      }
      assert_response :unprocessable_entity

      student.reload
      assert_nil student.parent_email
    end

    test "single-auth student with a password cannot set parent_email with the wrong password" do
      # so it's possible to add a recovery option to their account.  Once they are
      # on multi-auth they can just add an email or another SSO, so this is no
      # longer needed.
      student = create :student, password: 'drowssap'
      assert_nil student.parent_email
      refute_nil student.encrypted_password

      sign_in student
      put '/users', params: {
        format: 'json',
        user: {
          parent_email: 'parent@example.com',
          current_password: 'wrong-password'
        }
      }
      assert_response :unprocessable_entity

      student.reload
      assert_nil student.parent_email
    end

    test "single-auth student can update with a blank parent email without password" do
      student = create :student, :unmigrated_clever_sso
      assert_nil student.hashed_email
      assert_nil student.parent_email

      sign_in student
      put '/users', params: {
        format: 'json',
        user: {parent_email: '', age: '9'}
      }
      assert_response :no_content

      student.reload
      assert_nil student.parent_email
    end

    # The next several tests explore profile changes for users with or without
    # passwords.  Examples of users without passwords are users that authenticate
    # via oauth (a third-party account), or students with a picture password.

    test "editing password of student-without-password is allowed" do
      student_without_password = create :student, encrypted_password: ''
      assert student_without_password.encrypted_password.blank?

      assert can_edit_password_without_password? student_without_password
      # Current password is entirely ignored in this case
      assert can_edit_password_with_password? student_without_password, 'wrongpassword'
      assert can_edit_password_with_password? student_without_password, ''
    end

    test "editing password of student-with-password requires current password" do
      student_with_password = create :student, password: 'oldpassword'
      refute can_edit_password_without_password? student_with_password
      refute can_edit_password_with_password? student_with_password, 'wrongpassword'
      assert can_edit_password_with_password? student_with_password, 'oldpassword'
    end

    test "editing password of teacher-without-password is allowed" do
      teacher_without_password = create :teacher, encrypted_password: ''
      assert teacher_without_password.encrypted_password.blank?

      assert can_edit_password_without_password? teacher_without_password
      # Current password is entirely ignored in this case
      assert can_edit_password_with_password? teacher_without_password, 'wrongpassword'
      assert can_edit_password_with_password? teacher_without_password, ''
    end

    test "editing password of teacher-with-password requires current password" do
      teacher_with_password = create :teacher, password: 'oldpassword'
      refute can_edit_password_without_password? teacher_with_password
      refute can_edit_password_with_password? teacher_with_password, 'wrongpassword'
      assert can_edit_password_with_password? teacher_with_password, 'oldpassword'
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
  end
end
