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
    user = create :user, email: 'example@email.com', password: 'mypassword'
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
    teacher = create :teacher, :with_google_authentication_option, encrypted_password: nil
    teacher.update_attribute(:password, nil)
    sign_in teacher

    put :update, params: {user: {password: 'mypassword', password_confirmation: 'mypassword'}}
    teacher.reload
    assert_response :redirect
    assert teacher.valid_password?('mypassword')
  end

  test "update: student without a password can add a password" do
    student = create :student, :with_google_authentication_option, encrypted_password: nil
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
      session.delete(:user_return_to)
      get :new, params: {user_return_to: url}
      assert_equal url, session[:user_return_to]
    end
  end

  test "teachers go to specified return to url after signing up" do
    session[:user_return_to] = user_return_to = '//test.code.org/the-return-to-url'

    assert_creates(User) do
      post :create, params: {user: @default_params}
    end

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
      assert_equal AuthenticationOption::EMAIL, assigns(:user).primary_contact_info.credential_type
      assert_equal User::TYPE_STUDENT, assigns(:user).user_type
      assert_equal '', assigns(:user).email
      assert_equal User.hash_email('an@email.address'), assigns(:user).hashed_email
    end
  end

  test "create as under 13 student with client side hashed email" do
    Timecop.travel Time.local(2013, 9, 1, 12, 0, 0) do
      @default_params.delete(:email)
      params_with_hashed_email = @default_params.merge(
        {hashed_email: User.hash_email('an@email.address')}
      )

      assert_creates(User) do
        post :create, params: {user: params_with_hashed_email}
      end

      assert_redirected_to '/'

      assert_equal 'A name', assigns(:user).name
      assert_equal 'F', assigns(:user).gender
      assert_equal Date.today - 13.years, assigns(:user).birthday
      assert_equal AuthenticationOption::EMAIL, assigns(:user).primary_contact_info.credential_type
      assert_equal User::TYPE_STUDENT, assigns(:user).user_type
      assert_equal '', assigns(:user).email
      assert_equal User.hash_email('an@email.address'), assigns(:user).hashed_email
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
    teacher_params = @default_params.update(user_type: 'teacher', age: '', email_preference_opt_in: 'yes')

    assert_does_not_create(User) do
      post :create, params: {user: teacher_params}
    end

    assert_equal ["Age is required"], assigns(:user).errors.full_messages
  end

  test "create new teacher with us ip sends email with us content" do
    teacher_params = @default_params.update(user_type: 'teacher', email_preference_opt_in: 'yes')
    Geocoder.stubs(:search).returns([OpenStruct.new(country_code: 'US')])
    assert_creates(User) do
      post :create, params: {user: teacher_params}
    end

    mail = ActionMailer::Base.deliveries.first
    assert_equal 'Welcome to Code.org!', mail.subject
    assert mail.body.to_s =~ /Hadi Partovi/
    assert mail.body.to_s =~ /New to teaching computer science/
  end

  test "create new teacher with non-us ip sends email without us content" do
    teacher_params = @default_params.update(user_type: 'teacher', email_preference_opt_in: 'yes')
    Geocoder.stubs(:search).returns([OpenStruct.new(country_code: 'CA')])
    assert_creates(User) do
      post :create, params: {user: teacher_params}
    end

    mail = ActionMailer::Base.deliveries.first
    assert_equal 'Welcome to Code.org!', mail.subject
    assert mail.body.to_s =~ /Hadi Partovi/
    refute mail.body.to_s =~ /New to teaching computer science/
  end

  test 'create new teacher with es-MX locale sends localized welcome email' do
    with_default_locale('es-MX') do
      teacher_params = @default_params.update(user_type: 'teacher', email_preference_opt_in: 'yes')
      post :create, params: {user: teacher_params}
      mail = ActionMailer::Base.deliveries.first
      assert_equal I18n.t('teacher_mailer.new_teacher_subject', locale: 'es-MX'), mail.subject
      assert_match /Hola/, mail.body.to_s
    end
  end

  test "create new teacher with opt-in option as yes writes email preference as yes" do
    teacher_params = @default_params.update(user_type: 'teacher', email_preference_opt_in: 'yes')
    Geocoder.stubs(:search).returns([OpenStruct.new(country_code: 'CA')])
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
    teacher_params = @default_params.update(user_type: 'teacher', email_preference_opt_in: 'no')
    Geocoder.stubs(:search).returns([OpenStruct.new(country_code: 'CA')])
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
    eu_student_params = @default_params.update(
      data_transfer_agreement_required: "1"
    )

    assert_does_not_create(User) do
      post :create, params: {user: eu_student_params}
    end
  end

  test "create new student in eu succeeds with value" do
    eu_student_params = @default_params.update(
      data_transfer_agreement_required: "1",
      data_transfer_agreement_accepted: "1",
    )

    assert_creates(User) do
      post :create, params: {user: eu_student_params}
    end
  end

  test "create new student does not send email" do
    student_params = @default_params

    assert_creates(User) do
      post :create, params: {user: student_params}
    end
    assert ActionMailer::Base.deliveries.empty?
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
    frozen_time = Date.parse('1985-10-26 01:20:00')
    DateTime.stubs(:now).returns(frozen_time)
    assert_creates(SignIn) do
      post :create, params: {user: @default_params}
    end
    sign_in = SignIn.last
    assert sign_in
    assert_equal 1, sign_in.sign_in_count
    assert_equal frozen_time, sign_in.sign_in_at
  end

  test "display name edit field absent for picture account" do
    picture_student = create(:student_in_picture_section)
    sign_in picture_student

    get :edit
    assert_response :success
    assert_select '#user_name', false, 'This page should not contain an editable display name field'
  end

  test "display name edit field present for word account" do
    word_student = create(:student_in_word_section)
    sign_in word_student

    get :edit
    assert_response :success
    assert_select '#user_name', 1
  end

  test "display name edit field present for password account" do
    student = create(:student)
    sign_in student

    get :edit
    assert_response :success
    assert_select '#user_name', 1
  end

  test "existing account sign in/up links redirect to user edit page" do
    get :existing_account, params: {email: "test@email.com", provider: "facebook"}
    assert_response :success
    assert_select "a[href=?]", "/users/sign_in?user_return_to=%2Fusers%2Fedit"
    assert_select "a[href=?]", "/users/sign_up?user_return_to=%2Fusers%2Fedit"
  end
end
