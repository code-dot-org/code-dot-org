# -*- coding: utf-8 -*-
require 'test_helper'

class RegistrationsControllerTest < ActionController::TestCase

  setup do
    # stub properties so we don't try to hit pegasus db
    Properties.stubs(:get).returns nil
  end

  test "new" do
    get :new
    assert_response :success
  end

  test "create retries on Duplicate exception" do
    # some Mocha shenanigans to simulate throwing a duplicate entry
    # error and then succeeding by returning the existing user

    exception = ActiveRecord::RecordNotUnique.new(Mysql2::Error.new("Duplicate entry 'coder1234574782' for key 'index_users_on_username'"))
    User.any_instance.stubs(:save).raises(exception).then.returns(true)
    User.any_instance.stubs(:persisted?).returns(true)

    student_params = {name: "A name",
                      password: "apassword",
                      email: 'an@email.address',
                      gender: 'F',
                      age: '13',
                      user_type: 'student'}

    post :create, user: student_params

    assert_redirected_to '/'

    # we are still stubbing user.save (even though we returned true so
    # we can't actually check that the user was created)
  end

  test "create as student with age" do
    Timecop.travel Time.local(2013, 9, 1, 12, 0, 0) do
      student_params = {name: "A name",
                        password: "apassword",
                        email: 'an@email.address',
                        gender: 'F',
                        age: '13',
                        user_type: 'student'}

      assert_creates(User) do
        post :create, user: student_params
      end

      assert_redirected_to '/'

      assert_equal 'A name', assigns(:user).name
      assert_equal 'F', assigns(:user).gender
      assert_equal Date.today - 13.years, assigns(:user).birthday
      assert_equal nil, assigns(:user).provider
      assert_equal User::TYPE_STUDENT, assigns(:user).user_type
      assert_equal 'an@email.address', assigns(:user).email
    end
  end

  test "create as under 13 student with client side hashed email" do
    Timecop.travel Time.local(2013, 9, 1, 12, 0, 0) do
      student_params = {name: "A name",
                        password: "apassword",
                        email: '',
                        hashed_email: Digest::MD5.hexdigest('hidden@email.com'),
                        gender: 'F',
                        age: '9',
                        user_type: 'student'}

      assert_creates(User) do
        post :create, user: student_params
      end

      assert_redirected_to '/'

      assert_equal 'A name', assigns(:user).name
      assert_equal 'F', assigns(:user).gender
      assert_equal Date.today - 9.years, assigns(:user).birthday
      assert_equal nil, assigns(:user).provider
      assert_equal User::TYPE_STUDENT, assigns(:user).user_type
      assert_equal '', assigns(:user).email
      assert_equal Digest::MD5.hexdigest('hidden@email.com'), assigns(:user).hashed_email
    end
  end

  test "create as student requires age" do
    student_params = {name: "A name",
                      password: "apassword",
                      email: 'an@email.address',
                      gender: 'F',
                      age: '',
                      user_type: 'student'}

    assert_does_not_create(User) do
      post :create, user: student_params
    end

    assert_equal ["Age is required"], assigns(:user).errors.full_messages
  end

  test "create does not allow pandas in name" do
    student_params = {name: panda_panda,
                      password: "apassword",
                      email: 'an@email.address',
                      gender: 'F',
                      age: '15',
                      user_type: 'student'}

    assert_does_not_create(User) do
      post :create, user: student_params
    end

    assert_equal ["Display Name is invalid"], assigns(:user).errors.full_messages
  end

  test "create does not allow pandas in email" do
    student_params = {name: "A name",
                      password: "apassword",
                      email: "#{panda_panda}@panda.com",
                      gender: 'F',
                      age: '15',
                      user_type: 'student'}

    # don't ask the db for existing panda emails
    User.expects(:find_by_email_or_hashed_email).never

    assert_does_not_create(User) do
      post :create, user: student_params
    end

    assert_equal ["Email is invalid"], assigns(:user).errors.full_messages
  end

  test "create allows chinese in name" do
    student_params = {name: '樊瑞',
                      password: "apassword",
                      email: 'an@email.address',
                      gender: 'F',
                      age: '15',
                      user_type: 'student'}

    assert_creates(User) do
      post :create, user: student_params
    end
  end

  test "create as teacher requires age" do
    teacher_params = {name: "A name",
                      password: "apassword",
                      email: 'an@email.address',
                      gender: 'F',
                      age: '',
                      user_type: 'teacher'}

    assert_does_not_create(User) do
      post :create, user: teacher_params
    end

    assert_equal ["Age is required"], assigns(:user).errors.full_messages
  end

  test "create as student requires email" do
    student_params = {name: "A name",
                      password: "apassword",
                      email: nil,
                      user_type: 'student',
                      age: '10'}

    assert_does_not_create(User) do
      post :create, user: student_params
    end

    assert_equal ["Email is required"], assigns(:user).errors.full_messages
  end

  test "create requires case insensitive unique email" do
    create(:student, email: 'not_a@unique.email')
    student_params = {name: "A name",
                      password: "apassword",
                      email: 'Not_A@unique.email',
                      user_type: 'student',
                      age: '10'}

    assert_does_not_create(User) do
      post :create, user: student_params
    end

    assert_equal ["Email has already been taken"], assigns(:user).errors.full_messages
  end

  test "update student with utf8mb4 in name fails" do
    student = create :student

    sign_in student

    assert_does_not_create(User) do
      post :update, user: {name: panda_panda}
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
      post :update, user: {email: "#{panda_panda}@panda.xx", current_password: '00secret'}
    end

    assert_response :success # which actually means an error...
    assert_equal ['Email is invalid'], assigns(:user).errors.full_messages
    assert_select 'div#error_explanation', /Email is invalid/ # ... is rendered on the page
  end

  test "update student with age" do
    Timecop.travel Time.local(2013, 9, 1, 12, 0, 0) do
      student = create :student, birthday: '1981/03/24'

      sign_in student

      post :update, format: :js, user: {age: 9}
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

      post :update, format: :js, user: {age: {"Pr" => nil}}
      assert_response :no_content

      # did not change
      assert_equal '1981-03-24', assigns(:user).birthday.to_s
    end
  end

  test "update under 13 student with client side hashed email" do
    student = create :student, birthday: '1981/03/24'
    sign_in student

    post :update, user: {age: '9',
                         email: '',
                         hashed_email: Digest::MD5.hexdigest('hidden@email.com'),
                        }

    assert_redirected_to '/'

    assert_equal '', assigns(:user).email
    assert_equal Digest::MD5.hexdigest('hidden@email.com'), assigns(:user).hashed_email
  end

  test "update over 13 student with plaintext email" do
    student = create :student, birthday: '1981/03/24', password: 'whatev'
    sign_in student

    post :update, user: {age: '19',
                         email: 'hashed@email.com',
                         current_password: 'whatev' # need this to change email
                        }

    assert_redirected_to '/'

    assert_equal 'hashed@email.com', assigns(:user).email
    assert_equal Digest::MD5.hexdigest('hashed@email.com'), assigns(:user).hashed_email
  end

  test "sign up with devise.user_attributes in session" do
    # when someone logs in with oauth and we need additional
    # information, devise saves the user attributes in the session and
    # redirects to the sign up page

    session['devise.user_attributes'] =
      User.new(provider: 'facebook', email: 'email@facebook.xx', user_type: 'student').attributes

    get :new

    assert_equal 'email@facebook.xx', assigns(:user).email
    assert_equal nil, assigns(:user).username
    assert_equal nil, assigns(:user).age

    assert_equal ['Display Name is required', "Age is required"],
      assigns(:user).errors.full_messages
  end

  test 'sign up as teacher' do
    get :new, user: {user_type: 'teacher'}

    assert_response :success

    # no age dropdown, yes age hidden field
    assert_select 'select[name*="age"]', 0
    assert_select 'input[type="hidden"][name*="age"][value="21"]'
  end

  test 'sign up as student' do
    get :new, user: {user_type: 'student'}

    assert_response :success
    assert_select 'select[name*="age"]'
  end

  test 'deleting sets deleted at on a user' do
    user = create :user
    sign_in user

    delete :destroy

    user = user.reload
    assert user.deleted_at
  end

  test 'edit shows alert for unconfirmed email for teachers' do
    user = create :teacher, email: 'my_email@test.xx', confirmed_at: nil

    sign_in user
    get :edit

    assert_response :success
    assert_select '.alert span', /Your email address my_email@test.xx has not been confirmed:/
    assert_select '.alert input[value="my_email@test.xx"]'
    assert_select '.alert .btn[value="Resend confirmation instructions"]'
  end

  test 'edit does not show alert for unconfirmed email for students' do
    user = create :student, email: 'my_email@test.xx', confirmed_at: nil

    sign_in user
    get :edit

    assert_response :success
    assert_select '.alert', 0
  end

  test 'edit does not show alert for unconfirmed email for teachers if already confirmed' do
    user = create :teacher, email: 'my_email@test.xx', confirmed_at: Time.now

    sign_in user
    get :edit

    assert_response :success
    assert_select '.alert', 0
  end
end
