require 'test_helper'

################################################################################
#
# DEPRECATION NOTICE
#
# Please locate new tests for RegistrationsController in files for individual
# routes under one of:
#   test/integration/registration/*_test.rb
#   test/integration/omniauth/*_test.rb
#
# New tests should inherit from ActionDispatch::IntegrationTest instead of
# ActionController::TestCase
#
################################################################################

class RegistrationsControllerTest < ActionController::TestCase
  setup do
    @default_params = {
      name: 'A name',
      password: 'apassword',
      email: 'an@email.address',
      gender: 'F',
      age: '13',
      user_type: 'student'
    }
    ActionController::TestRequest.any_instance.stubs(:country_code)
  end

  test "update: returns bad_request if user param is nil" do
    student = create(:student)
    sign_in student

    put :update, params: {}
    assert_response :bad_request
  end

  test "update: returns bad_request if user_type param is present" do
    student = create(:student)
    sign_in student

    put :update, params: {user: {user_type: 'student'}}
    assert_response :bad_request
  end

  test "update: returns bad_request if email param is present" do
    student = create(:student)
    sign_in student

    put :update, params: {user: {email: 'example@email.com'}}
    assert_response :bad_request
  end

  test "update: returns bad_request if hashed_email param is present" do
    student = create(:student)
    sign_in student

    put :update, params: {user: {hashed_email: 'abcdef'}}
    assert_response :bad_request
  end

  test "update: does not update user password if user cannot edit password" do
    teacher = create(:teacher, password: 'mypassword')
    sign_in teacher

    User.any_instance.stubs(:can_edit_password?).returns(false)

    put :update, params: {user: {current_password: 'notmypassword', password: 'newpassword', password_confirmation: 'newpassword'}}
    teacher.reload
    assert_response :success
    assert_template :edit
    assert teacher.valid_password?('mypassword')
  end

  test "update: does not update user password if password is incorrect" do
    teacher = create(:teacher, password: 'mypassword')
    sign_in teacher

    put :update, params: {user: {current_password: 'notmypassword', password: 'newpassword', password_confirmation: 'newpassword'}}
    teacher.reload
    assert_response :success
    assert_template :edit
    assert teacher.valid_password?('mypassword')
  end

  test "update: does not update user with a new password without current_password param" do
    user = create(:user, email: 'example@email.com', password: 'mypassword')
    sign_in user

    put :update, params: {user: {password: 'newpassword', password_confirmation: 'newpassword'}}
    user.reload
    assert_response :success
    assert_template :edit
    assert user.valid_password?('mypassword')
  end

  test "update: updates user password if password is correct" do
    teacher = create(:teacher, password: 'mypassword')
    sign_in teacher

    put :update, params: {user: {current_password: 'mypassword', password: 'newpassword', password_confirmation: 'newpassword'}}
    teacher.reload
    assert_response :redirect
    assert teacher.valid_password?('newpassword')
  end

  test "update: teacher without a password can add a password" do
    teacher = create(:teacher, :with_google_authentication_option, encrypted_password: nil)
    teacher.update_attribute(:password, nil)
    sign_in teacher

    put :update, params: {user: {password: 'mypassword', password_confirmation: 'mypassword'}}
    teacher.reload
    assert_response :redirect
    assert teacher.valid_password?('mypassword')
  end

  test "update: student without a password can add a password" do
    student = create(:student, :with_google_authentication_option, encrypted_password: nil)
    student.update_attribute(:password, nil)
    sign_in student

    put :update, params: {user: {password: 'mypassword', password_confirmation: 'mypassword'}}
    student.reload
    assert_response :redirect
    assert student.valid_password?('mypassword')
  end

  test "update: updates user info if password is not required" do
    student = create(:student)
    sign_in student

    put :update, params: {
      user: {
        name: 'New Name',
        username: 'newusername',
        gender: 'f',
        age: 12,
        school: 'My School',
      }
    }
    student.reload
    assert_response :redirect
    assert_equal 'New Name', student.name
    assert_equal 'newusername', student.username
    assert_equal 'f', student.gender
    assert_equal 12, student.age
    assert_equal 'My School', student.school
  end

  test "user cannot update username to existing username" do
    student = create(:student)
    new_student = create(:student)

    new_student.username = "newusername"
    new_student.save

    sign_in student
    put :update, params: {
      user: {
        username: 'newusername',
      }
    }
    assert_equal ["Username has already been taken"], assigns(:user).errors.full_messages
    refute_equal 'newusername', student.reload.username
  end

  test "parent_email: student can add a parent email without opt in" do
    student = create(:student)
    sign_in student

    patch :set_parent_email, params: {
      user: {
        parent_email: 'parent@example.com',
        parent_email_preference_opt_in: ''
      }
    }
    student.reload
    assert_response :no_content
    assert_equal 'parent@example.com', student.parent_email
  end

  test "parent_email: student can add a parent email with opt in" do
    student = create(:student)
    sign_in student

    patch :set_parent_email, params: {
      user: {
        parent_email: 'parent@example.com',
        parent_email_preference_opt_in: 'yes',
        parent_email_preference_source: 'PARENT_EMAIL_CHANGE'
      }
    }
    student.reload
    assert_response :no_content
    assert_equal 'parent@example.com', student.parent_email

    email_preference = EmailPreference.last
    assert_equal "parent@example.com", email_preference[:email]
    assert email_preference[:opt_in]
    assert_equal EmailPreference::PARENT_EMAIL_CHANGE, email_preference[:source]
  end

  test "sign up page saves return to url in session" do
    # Note that we currently have no restrictions on what the domain of the
    # redirect url can be; we may at some point want to add domain
    # restrictions, but if we do so we want to make sure that both
    # studio.code.org and code.org are supported.
    #
    # See also the "sign in page saves return to url in session" test in
    # sessions_controller_test
    urls = [
      "/foo",
      "//studio.code.org/foo",
      "//code.org/foo",
      "//some_other_domain.com/foo"
    ]

    urls.each do |url|
      get :new, params: {user_return_to: url}
      user_return_to_url = users_sign_up_account_type_url + "?user_return_to=#{url}"
      assert_redirected_to user_return_to_url
    end
  end

  test "create existing email error on a Duplicate exception" do
    # some Mocha shenanigans to simulate throwing a duplicate entry
    # error and then succeeding by returning the existing user

    duplicate_entry_exception = ActiveRecord::RecordNotUnique.new(Mysql2::Error.new("Duplicate entry 'coder1234574782' for key 'index_users_on_username'"))
    User.any_instance.stubs(:save).raises(duplicate_entry_exception)

    teacher_params = set_up_partial_registration(@default_params)

    post :create, params: {user: teacher_params}
    assert_includes response.body, "Validation failed: Email has already been taken"
  end

  test "create user with invalid fields throws 400 error" do
    name_longer_than_70_char = '12345678901234567890123456789012345678901234567890123456789012345678901234567890'
    teacher_params = set_up_partial_registration(@default_params.merge({name: name_longer_than_70_char}))

    post :create, params: {user: teacher_params}
    assert_equal response.status, 400
    assert_includes response.body, "Validation failed: Display Name is too long (maximum is 70 characters)"
  end

  test "create as student with age" do
    Timecop.travel Time.local(2013, 9, 1, 12, 0, 0) do
      student_params = set_up_partial_registration(@default_params)
      assert_creates(User) do
        post :create, params: {user: student_params}
      end

      student = User.last

      assert_equal 'A name', student.name
      assert_equal 'f', student.gender
      assert_equal Time.zone.today - 13.years, student.birthday
      assert_equal AuthenticationOption::EMAIL, student.primary_contact_info.credential_type
      assert_equal User::TYPE_STUDENT, student.user_type
      assert_equal '', student.email
      assert_equal User.hash_email('an@email.address'), student.hashed_email
    end
  end

  test "create as under 13 student with client side hashed email" do
    Timecop.travel Time.local(2013, 9, 1, 12, 0, 0) do
      student_params = set_up_partial_registration(@default_params)
      student_params.delete(:email)
      params_with_hashed_email = student_params.merge(
        {hashed_email: User.hash_email('an@email.address')}
      )

      assert_creates(User) do
        post :create, params: {user: params_with_hashed_email}
      end

      student = User.last

      assert_equal 'A name', student.name
      assert_equal 'f', student.gender
      assert_equal Time.zone.today - 13.years, student.birthday
      assert_equal AuthenticationOption::EMAIL, student.primary_contact_info.credential_type
      assert_equal User::TYPE_STUDENT, student.user_type
      assert_equal '', student.email
      assert_equal User.hash_email('an@email.address'), student.hashed_email
    end
  end

  test "create as student requires age" do
    params_without_age = set_up_partial_registration(@default_params.update(age: ''))

    assert_does_not_create(User) do
      post :create, params: {user: params_without_age}
      assert_includes response.body, "Validation failed: Age is required"
    end
  end

  test "create allows pandas in name" do
    params_with_panda_name = set_up_partial_registration(@default_params.update(name: panda_panda))

    assert_creates(User) do
      post :create, params: {user: params_with_panda_name}
    end
  end

  test "create does not allow pandas in email" do
    params_with_panda_email = set_up_partial_registration(@default_params.update(email: "#{panda_panda}@panda.com"))

    # don't ask the db for existing panda emails
    User.expects(:find_by_email_or_hashed_email).never

    assert_does_not_create(User) do
      post :create, params: {user: params_with_panda_email}
      assert_includes response.body, "Email is invalid"
    end
  end

  test "create allows chinese in name" do
    params_with_chinese_name = set_up_partial_registration(@default_params.update(name: '樊瑞'))

    assert_creates(User) do
      post :create, params: {user: params_with_chinese_name}
    end
  end

  test "create as teacher allows chinese in given name" do
    params_with_chinese_name = set_up_partial_registration(@default_params.update(user_type: 'teacher', given_name: '樊瑞'))

    assert_creates(User) do
      post :create, params: {user: params_with_chinese_name}
    end
  end

  test "create as teacher allows chinese in family name" do
    params_with_chinese_name = set_up_partial_registration(@default_params.update(user_type: 'teacher', family_name: '樊瑞'))

    assert_creates(User) do
      post :create, params: {user: params_with_chinese_name}
    end
  end

  test "create as teacher automatically sets age" do
    teacher_params = set_up_partial_registration(@default_params.update(user_type: 'teacher', age: '', email_preference_opt_in: true))

    assert_creates(User) do
      post :create, params: {user: teacher_params}
    end

    refute_equal ["Age is required"], assigns(:user).errors.full_messages
  end

  test "create new teacher with MailJet enabled sends welcome email" do
    teacher_params = set_up_partial_registration(@default_params.update(user_type: 'teacher', email_preference_opt_in: true))
    MailJet.stubs(:enabled?).returns(true)
    MailJet.expects(:create_contact_and_add_to_welcome_series).once
    assert_creates(User) do
      post :create, params: {user: teacher_params}
    end

    assert_empty ActionMailer::Base.deliveries
  end

  test "create new teacher with opt-in option as yes writes email preference as yes" do
    teacher_params = set_up_partial_registration(@default_params.update(user_type: 'teacher', email_preference_opt_in: true))
    assert_creates(User) do
      assert_creates(EmailPreference) do
        post :create, params: {user: teacher_params}
      end
    end

    email_preference = EmailPreference.last
    assert_equal "an@email.address", email_preference[:email]
    assert email_preference[:opt_in]
    assert_equal EmailPreference::ACCOUNT_SIGN_UP, email_preference[:source]
  end

  test "create new teacher with opt-in option as no writes email preference as no" do
    teacher_params = set_up_partial_registration(@default_params.update(user_type: 'teacher', email_preference_opt_in: false))
    assert_creates(User) do
      assert_creates(EmailPreference) do
        post :create, params: {user: teacher_params}
      end
    end

    email_preference = EmailPreference.last
    assert_equal "an@email.address", email_preference[:email]
    refute email_preference[:opt_in]
    assert_equal EmailPreference::ACCOUNT_SIGN_UP, email_preference[:source]
  end

  test "create new student in eu fails when missing value" do
    eu_student_params = set_up_partial_registration(@default_params.update(data_transfer_agreement_required: "1"))

    assert_does_not_create(User) do
      post :create, params: {user: eu_student_params}
      assert_includes response.body, "Validation failed: Data transfer agreement accepted must be accepted"
    end
  end

  test "create new student in eu succeeds with value" do
    eu_student_params = set_up_partial_registration(@default_params.update(data_transfer_agreement_required: "1", data_transfer_agreement_accepted: "1"))

    assert_creates(User) do
      post :create, params: {user: eu_student_params}
    end
  end

  test "create new student does not send email" do
    student_params = set_up_partial_registration(@default_params)

    assert_creates(User) do
      post :create, params: {user: student_params}
    end
    assert ActionMailer::Base.deliveries.empty?
  end

  test "create as student requires email" do
    @default_params.delete(:email)
    set_up_partial_registration(@default_params)
    assert_does_not_create(User) do
      post :create, params: {user: @default_params}
      assert_includes response.body, "Email is required"
    end
  end

  test "create requires case insensitive unique email" do
    # Create original account with given email
    original_email_params = set_up_partial_registration(@default_params.update(email: 'not_a@unique.email'))
    assert_creates(User) do
      post :create, params: {user: original_email_params}
    end

    # Create second account with given email
    assert_does_not_create(User) do
      same_email_params = set_up_partial_registration(@default_params.update(email: 'not_a@unique.email'))
      post :create, params: {user: same_email_params}
    end
  end

  test "create causes UserGeo creation" do
    request.remote_addr = '1.2.3.4'
    user_params = set_up_partial_registration(@default_params)
    assert_creates(UserGeo) do
      post :create, params: {user: user_params}
    end

    user_geo = UserGeo.last
    assert user_geo
    assert user_geo.ip_address = '1.2.3.4'
  end

  test "create causes SignIn creation" do
    frozen_time = Date.parse('1985-10-26 01:20:00')
    DateTime.stubs(:now).returns(frozen_time)
    user_params = set_up_partial_registration(@default_params)
    assert_creates(SignIn) do
      post :create, params: {user: user_params}
    end
    sign_in = SignIn.last
    assert sign_in
    assert_equal 1, sign_in.sign_in_count
    assert_equal frozen_time, sign_in.sign_in_at
  end

  test "student can add a parent email without opt in" do
    student_with_parent_params = set_up_partial_registration(@default_params.update(parent_email_preference_email: 'parent@example.com', parent_email_preference_opt_in: ''))

    ParentMailer.any_instance.expects(:parent_email_added_to_student_account).once
    assert_creates(User) do
      post :create, params: {user: student_with_parent_params}
    end
    student = User.last
    student.reload

    assert_equal 'parent@example.com', student.parent_email

    email_preference = EmailPreference.last
    assert_equal 'parent@example.com', email_preference[:email]
    refute email_preference[:opt_in]
    assert_equal EmailPreference::ACCOUNT_SIGN_UP, email_preference[:source]
  end

  test "student can add a parent email with opt in" do
    student_with_parent_params = set_up_partial_registration(@default_params.update(parent_email_preference_email: 'parent@example.com', parent_email_preference_opt_in: true))

    ParentMailer.any_instance.expects(:parent_email_added_to_student_account).once
    assert_creates(User) do
      post :create, params: {user: student_with_parent_params}
    end
    student = User.last
    student.reload

    assert_equal 'parent@example.com', student.parent_email

    email_preference = EmailPreference.last
    assert_equal 'parent@example.com', email_preference[:email]
    assert email_preference[:opt_in]
    assert_equal EmailPreference::ACCOUNT_SIGN_UP, email_preference[:source]
  end

  test "existing account sign in/up links redirect to user edit page" do
    get :existing_account, params: {email: "test@email.com", provider: "facebook"}
    assert_response :success
    assert_select "a[href=?]", "/users/sign_in?user_return_to=%2Fusers%2Fedit"
    assert_select "a[href=?]", "/users/sign_up/account_type?user_return_to=%2Fusers%2Fedit"
  end

  test "the us_state and country_code attributes can be set and updated" do
    user = create(:student, us_state: "CO", country_code: "US")
    assert_equal "CO", user.us_state
    assert_equal "US", user.country_code
    sign_in user

    put :update, params: {user: {us_state: "??", country_code: "PR"}}
    user.reload
    assert_response :redirect
    assert_equal "??", user.us_state
    assert_equal "PR", user.country_code
  end

  test "student-entered gender is saved and properly sets the normalized gender value" do
    student = create(:student, gender_student_input: "female")
    assert_equal "female", student.gender_student_input
    assert_equal "f", student.gender
    sign_in student

    put :update, params: {user: {gender_student_input: "male"}}
    student.reload
    assert_equal "male", student.gender_student_input
    assert_equal "m", student.gender
  end

  test 'verifies lti users if they are a teacher' do
    lti_teacher_params = @default_params.update(user_type: 'teacher', email_preference_opt_in: 'yes')
    Policies::Lti.expects(:lti?).returns(true).at_least(1)
    Services::Lti.expects(:create_lti_user_identity).returns(:lti_user_identity).at_least(1)
    Queries::Lti.expects(:get_lms_name_from_user).returns('test-lms')
    lti_teacher_params = set_up_partial_registration(lti_teacher_params)
    post :create, params: {user: lti_teacher_params}

    assert assigns(:user).verified_teacher?
  end

  test 'do not verify lti users if they are a student' do
    Policies::Lti.expects(:lti?).returns(true).at_least(1)
    Services::Lti.expects(:create_lti_user_identity).returns(:lti_user_identity).at_least(1)
    Queries::Lti.expects(:get_lms_name_from_user).returns('test-lms')

    student_params = set_up_partial_registration(@default_params)
    post :create, params: {user: student_params}

    assigns(:user).expects(:verify_teacher!).never
    refute assigns(:user).verified_teacher?
  end

  test 'redirects signed-in user to home if they attempt to access account_type url' do
    # Create a new user and sign them in
    picture_student = create(:student_in_picture_section)
    sign_in picture_student

    # Attempt to reach a sign up flow page
    get :account_type
    assert_redirected_to '/'
  end

  test 'redirects signed-in user to home if they attempt to access login_type url' do
    # Create a new user and sign them in
    picture_student = create(:student_in_picture_section)
    sign_in picture_student

    # Attempt to reach a sign up flow page
    get :login_type
    assert_redirected_to '/'
  end

  test 'redirects signed-in user to home if they attempt to access finish_teacher_account url' do
    # Create a new user and sign them in
    picture_student = create(:student_in_picture_section)
    sign_in picture_student

    # Attempt to reach a sign up flow page
    get :finish_teacher_account
    assert_redirected_to '/'
  end

  test 'redirects signed-in user to home if they attempt to access finish_student_account url' do
    # Create a new user and sign them in
    picture_student = create(:student_in_picture_section)
    sign_in picture_student

    # Attempt to reach a sign up flow page
    get :finish_student_account
    assert_redirected_to '/'
  end

  test 'redirects signed-in user to home if they attempt to access new' do
    # Create a new user and sign them in
    picture_student = create(:student_in_picture_section)
    sign_in picture_student

    get :new
    assert_redirected_to '/'
  end

  test 'redirects signed-in user to home if they attempt to access cancel' do
    # Create a new user and sign them in
    picture_student = create(:student_in_picture_section)
    sign_in picture_student

    get :cancel
    assert_redirected_to '/'
  end

  test 'redirects signed-in user to home if they attempt to access create' do
    # Create a new user and sign them in
    picture_student = create(:student_in_picture_section)
    sign_in picture_student

    get :create
    assert_redirected_to '/'
  end

  describe "#finish_teacher_account" do
    context "when launching from LTI tool for the first time and creating a new teacher account" do
      it "assigns redirect_url from session to preserve the LTI target_link_uri" do
        get :finish_teacher_account, session: {user_return_to: "/sync_course"}

        assert_equal "/sync_course", assigns(:redirect_url)
      end
    end
  end

  describe "#finish_student_account" do
    it "assigns redirect_url from session if set to preserve the target_link_uri" do
      get :finish_student_account, session: {user_return_to: "/sync_course"}

      assert_equal "/sync_course", assigns(:redirect_url)
    end
  end

  # Starts the sign-up flow's user-creation process in RegistrationController.begin_sign_up then
  # returns the parameters with the :password field removed (password is not used when the user is
  # created in RegistrationController.create).
  private def set_up_partial_registration(user_params)
    post :begin_sign_up, params: {user: {email: user_params[:email].presence, password: user_params[:password].presence, password_confirmation: user_params[:password].presence}}
    user_params.delete(:password)
    user_params
  end
end
