# -*- coding: utf-8 -*-
require 'test_helper'

class RegistrationsControllerTest < ActionController::TestCase
  setup do
    # stub properties so we don't try to hit pegasus db
    Properties.stubs(:get).returns nil

    @default_params = {
      name: 'A name',
      password: 'apassword',
      email: 'an@email.address',
      gender: 'F',
      age: '13',
      user_type: 'student'
    }
  end

  test "new" do
    get :new
    assert_response :success
  end

  test "sign up saves return to url in session" do
    user_return_to = 'http://code.org/a-return-to-url'
    get :new, params: {user_return_to:  user_return_to}

    assert_equal user_return_to, session[:user_return_to]
  end

  test "teachers go to specified return to url after signing up" do
    teacher = create(:teacher)

    session[:user_return_to] = user_return_to = '//test.code.org/the-return-to-url'

    post :create, params: {
      user: {
        login: '',
        hashed_email: teacher.hashed_email,
        password: teacher.password
      }
    }

    assert_signed_in_as teacher
    assert_redirected_to user_return_to
  end

  test "create retries on Duplicate exception" do
    # some Mocha shenanigans to simulate throwing a duplicate entry
    # error and then succeeding by returning the existing user

    exception = ActiveRecord::RecordNotUnique.new(Mysql2::Error.new("Duplicate entry 'coder1234574782' for key 'index_users_on_username'"))
    User.any_instance.stubs(:save).raises(exception).then.returns(true)
    User.any_instance.stubs(:persisted?).returns(true)

    post :create, params: {user: @default_params}

    assert_redirected_to '/'

    # we are still stubbing user.save (even though we returned true so
    # we can't actually check that the user was created)
  end

  test "create as student with age" do
    Timecop.travel Time.local(2013, 9, 1, 12, 0, 0) do
      assert_creates(User) do
        post :create, params: {user: @default_params}
      end

      assert_redirected_to '/'

      assert_equal 'A name', assigns(:user).name
      assert_equal 'F', assigns(:user).gender
      assert_equal Date.today - 13.years, assigns(:user).birthday
      assert_nil assigns(:user).provider
      assert_equal User::TYPE_STUDENT, assigns(:user).user_type
      assert_equal '', assigns(:user).email
      assert_equal User.hash_email('an@email.address'), assigns(:user).hashed_email
    end
  end

  test "create as under 13 student with client side hashed email" do
    Timecop.travel Time.local(2013, 9, 1, 12, 0, 0) do
      @default_params.delete(:email)
      params_with_hashed_email = @default_params.merge(
        {hashed_email: Digest::MD5.hexdigest('an@email.address')}
      )

      assert_creates(User) do
        post :create, params: {user: params_with_hashed_email}
      end

      assert_redirected_to '/'

      assert_equal 'A name', assigns(:user).name
      assert_equal 'F', assigns(:user).gender
      assert_equal Date.today - 13.years, assigns(:user).birthday
      assert_nil assigns(:user).provider
      assert_equal User::TYPE_STUDENT, assigns(:user).user_type
      assert_equal '', assigns(:user).email
      assert_equal Digest::MD5.hexdigest('an@email.address'), assigns(:user).hashed_email
    end
  end

  test "create as student requires age" do
    params_without_age = @default_params.update(age: '')

    assert_does_not_create(User) do
      post :create, params: {user: params_without_age}
    end

    assert_equal ["Age is required"], assigns(:user).errors.full_messages
  end

  test "create does not allow pandas in name" do
    params_with_panda_name = @default_params.update(name: panda_panda)

    assert_does_not_create(User) do
      post :create, params: {user: params_with_panda_name}
    end

    assert_equal ["Display Name is invalid"], assigns(:user).errors.full_messages
  end

  test "create does not allow pandas in email" do
    params_with_panda_email = @default_params.update(
      email: "#{panda_panda}@panda.com"
    )

    # don't ask the db for existing panda emails
    User.expects(:find_by_email_or_hashed_email).never

    assert_does_not_create(User) do
      post :create, params: {user: params_with_panda_email}
    end

    assert_equal ["Email is invalid"], assigns(:user).errors.full_messages
  end

  test "create allows chinese in name" do
    params_with_chinese_name = @default_params.update(
      name: '樊瑞'
    )

    assert_creates(User) do
      post :create, params: {user: params_with_chinese_name}
    end
  end

  test "create as teacher requires age" do
    teacher_params = @default_params.update(user_type: 'teacher', age: '')

    assert_does_not_create(User) do
      post :create, params: {user: teacher_params}
    end

    assert_equal ["Age is required"], assigns(:user).errors.full_messages
  end

  test "create as student requires email" do
    @default_params.delete(:email)

    assert_does_not_create(User) do
      post :create, params: {user: @default_params}
    end

    assert_equal ["Email is required"], assigns(:user).errors.full_messages
  end

  test "create requires case insensitive unique email" do
    create(:student, email: 'not_a@unique.email')
    params_with_non_unique_email = @default_params.update(
      email: 'not_a@unique.email'
    )

    assert_does_not_create(User) do
      post :create, params: {user: params_with_non_unique_email}
    end

    assert_equal ["Email has already been taken"], assigns(:user).errors.full_messages
  end

  test "create causes UserGeo creation" do
    request.remote_addr = '1.2.3.4'
    assert_creates(UserGeo) do
      post :create, params: {user: @default_params}
    end

    user_geo = UserGeo.last
    assert user_geo
    assert user_geo.ip_address = '1.2.3.4'
  end

  test "create causes SignIn creation" do
    frozen_time = '1985-10-26 01:20:00'
    DateTime.stubs(:now).returns(frozen_time)
    assert_creates(SignIn) do
      post :create, params: {user: @default_params}
    end
    sign_in = SignIn.last
    assert sign_in
    assert_equal 1, sign_in.sign_in_count
    assert_equal frozen_time + ' UTC', sign_in.sign_in_at.to_s
  end

  test "update student with utf8mb4 in name fails" do
    student = create :student

    sign_in student

    assert_does_not_create(User) do
      post :update, params: {user: {name: panda_panda}}
    end
    assert_response :success # which actually means an error...
    assert_equal ['Display Name is invalid'], assigns(:user).errors.full_messages
    assert_select 'div#error_explanation', /Display Name is invalid/ # ... is rendered on the page
  end

  test "update student with utf8mb4 in email fails" do
    student = create :student

    sign_in student

    # don't ask the db for existing panda emails
    User.expects(:find_by_email_or_hashed_email).never

    assert_does_not_create(User) do
      post :update, params: {
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

      post :update, params: {format: :js, user: {age: 9}}
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

      post :update, params: {format: :js, user: {age: {"Pr" => nil}}}
      assert_response :no_content

      # did not change
      assert_equal '1981-03-24', assigns(:user).birthday.to_s
    end
  end

  test "update student with client side hashed email" do
    student = create :student, birthday: '1981/03/24', password: 'whatev'
    sign_in student

    post :update, params: {
      user: {
        age: '9',
        email: '',
        hashed_email: Digest::MD5.hexdigest('hidden@email.com'),
        current_password: 'whatev' # need this to change email
      }
    }

    assert_redirected_to '/'

    assert_equal '', assigns(:user).email
    assert_equal Digest::MD5.hexdigest('hidden@email.com'), assigns(:user).hashed_email
  end

  test "update over 13 student with plaintext email" do
    student = create :student, birthday: '1981/03/24', password: 'whatev'
    sign_in student

    post :update, params: {
      user: {
        age: '19',
        email: 'hashed@email.com',
        current_password: 'whatev' # need this to change email
      }
    }

    assert_redirected_to '/'

    assert_equal '', assigns(:user).email
    assert_equal Digest::MD5.hexdigest('hashed@email.com'), assigns(:user).hashed_email
  end

  test 'update rejects unwanted parameters' do
    user = create :user, name: 'non-admin'
    sign_in user
    post :update, params: {user: {name: 'admin', admin: true}}

    user.reload
    assert_equal 'admin', user.name
    refute user.admin
  end

  test "sign up with devise.user_attributes in session" do
    # when someone logs in with oauth and we need additional
    # information, devise saves the user attributes in the session and
    # redirects to the sign up page

    session['devise.user_attributes'] =
      User.new(provider: 'facebook', email: 'email@facebook.xx', user_type: 'student').attributes

    get :new

    assert_equal 'email@facebook.xx', assigns(:user).email
    assert_nil assigns(:user).username
    assert_nil assigns(:user).age

    assert_equal ['Display Name is required', "Age is required"],
      assigns(:user).errors.full_messages
  end

  test 'deleting sets deleted at on a user' do
    user = create :user
    sign_in user

    delete :destroy

    user = user.reload
    assert user.deleted?
  end

  # The next several tests explore profile changes for users with or without
  # passwords.  Examples of users without passwords are users that authenticate
  # via oauth (a third-party account), or students with a picture password.

  test "editing password of student-without-password is not allowed" do
    student_without_password = create :student
    student_without_password.update_attribute(:encrypted_password, '')
    assert student_without_password.encrypted_password.blank?

    refute can_edit_password_without_password student_without_password
    refute can_edit_password_with_password student_without_password, 'wrongpassword'
    refute can_edit_password_with_password student_without_password, ''
  end

  test "editing password of student-with-password requires current password" do
    student_with_password = create :student, password: 'oldpassword'
    refute can_edit_password_without_password student_with_password
    refute can_edit_password_with_password student_with_password, 'wrongpassword'
    assert can_edit_password_with_password student_with_password, 'oldpassword'
  end

  test "editing password of teacher-without-password is not allowed" do
    teacher_without_password = create :teacher
    teacher_without_password.update_attribute(:encrypted_password, '')
    assert teacher_without_password.encrypted_password.blank?

    refute can_edit_password_without_password teacher_without_password
    refute can_edit_password_with_password teacher_without_password, 'wrongpassword'
    refute can_edit_password_with_password teacher_without_password, ''
  end

  test "editing password of teacher-with-password requires current password" do
    teacher_with_password = create :teacher, password: 'oldpassword'
    refute can_edit_password_without_password teacher_with_password
    refute can_edit_password_with_password teacher_with_password, 'wrongpassword'
    assert can_edit_password_with_password teacher_with_password, 'oldpassword'
  end

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

  def can_edit_password_without_password(user)
    new_password = 'newpassword'

    sign_in user
    post :update, params: {
      user: {
        password: new_password,
        password_confirmation: new_password
      }
    }

    user = user.reload
    user.valid_password? new_password
  end

  def can_edit_password_with_password(user, current_password)
    new_password = 'newpassword'

    sign_in user
    post :update, params: {
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
    post :update, params: {user: {email: new_email}}

    user = user.reload
    user.email == new_email || user.hashed_email == User.hash_email(new_email)
  end

  def can_edit_email_with_password(user, current_password)
    new_email = 'new@example.com'

    sign_in user
    post :update, params: {
      user: {email: new_email, current_password: current_password}
    }

    user = user.reload
    user.email == new_email || user.hashed_email == User.hash_email(new_email)
  end

  def can_edit_hashed_email_without_password(user)
    new_hashed_email = '729980b94e1439aeed40122476b0f695'

    sign_in user
    post :update, params: {user: {hashed_email: new_hashed_email}}

    user = user.reload
    user.hashed_email == new_hashed_email
  end

  def can_edit_hashed_email_with_password(user, current_password)
    new_hashed_email = '729980b94e1439aeed40122476b0f695'

    sign_in user
    post :update, params: {
      user: {hashed_email: new_hashed_email, current_password: current_password}
    }

    user = user.reload
    user.hashed_email == new_hashed_email
  end
end
