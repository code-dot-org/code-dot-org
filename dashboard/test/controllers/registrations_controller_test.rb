require 'test_helper'

class RegistrationsControllerTest < ActionController::TestCase

  setup do
    @request.env["devise.mapping"] = Devise.mappings[:user]
  end

  test "new" do
    get :new
    assert_response :success
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
    existing = create(:student, email: 'not_a@unique.email')
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

  test "update student with age" do
    Timecop.travel Time.local(2013, 9, 1, 12, 0, 0) do
      student = create :student, birthday: '1981/03/24'

      sign_in student

      post :update, user: {age: 9}
    
      assert_equal Date.today - 9.years, assigns(:user).birthday
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

end
