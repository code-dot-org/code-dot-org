require 'test_helper'
require 'rake'

class FollowersControllerTest < ActionController::TestCase
  setup do
    @laurel = create(:teacher)
    @laurel_section_1 = create(:section, user: @laurel)
    @laurel_section_2 = create(:section, user: @laurel)
    @laurel_section_script = create(:section, user: @laurel, script: Script.find_by_name('course1'))

    # add a few students to a section
    @laurel_student_1 = create(:follower, section: @laurel_section_1)
    @laurel_student_2 = create(:follower, section: @laurel_section_1)

    @chris = create(:teacher)
    @chris_section = create(:section, user: @chris)

    # student without section or teacher
    @student = create(:user)

    @picture_section = create(:section, login_type: Section::LOGIN_TYPE_PICTURE)
    @word_section = create(:section, login_type: Section::LOGIN_TYPE_WORD)

    @admin = create(:admin)

    @request.host = CDO.dashboard_hostname
  end

  test "student in picture section should be redirected to picture login when joining section" do
    get :student_user_new, params: {section_code: @picture_section.code}
    assert_redirected_to controller: 'sections', action: 'show', id: @picture_section.code
  end

  test "student in word section should be redirected to word login when joining section" do
    get :student_user_new, params: {section_code: @word_section.code}
    assert_redirected_to controller: 'sections', action: 'show', id: @word_section.code
  end

  test "section code with preceding and trailing whitespaces should redirect to login" do
    get :student_user_new, params: {section_code: '    ' + @word_section.code + '   '}
    assert_redirected_to controller: 'sections', action: 'show', id: @word_section.code

    get :student_user_new, params: {section_code: '    ' + @picture_section.code + '   '}
    assert_redirected_to controller: 'sections', action: 'show', id: @picture_section.code
  end

  test "student_user_new when not signed in" do
    get :student_user_new, params: {section_code: @chris_section.code}

    assert_response :success
    assert assigns(:user)

    refute assigns(:user).persisted?
  end

  test "student_user_new without section code" do
    get :student_user_new

    assert_response :success
    # form to type in section code
    assert_select 'input#section_code'
  end

  test "student_user_new when signed in" do
    sign_in @student

    assert_does_not_create(Follower) do
      get :student_user_new, params: {section_code: @chris_section.code}
    end

    assert_response :success
    assert_template 'followers/student_user_new'
  end

  test "student_user_new when signed in without section code" do
    sign_in @student
    assert_does_not_create(Follower) do
      get :student_user_new
    end

    assert_response :success
    assert_template 'followers/student_user_new'
  end

  test 'student_user_new errors when joining a section with deleted teacher' do
    @laurel.destroy
    sign_in @laurel_student_1.student_user

    assert_does_not_create(Follower) do
      get :student_user_new, params: {section_code: @laurel_section_1.code}
    end

    assert_redirected_to '/'
    assert_equal(
      I18n.t(
        'follower.error.section_not_found',
        section_code: @laurel_section_1.code
      ),
      flash[:alert]
    )
  end

  test 'student_user_new errors when joining a section with a student owner' do
    @laurel.update!(user_type: User::TYPE_STUDENT)
    sign_in @laurel_student_1.student_user

    assert_does_not_create(Follower) do
      get :student_user_new, params: {section_code: @laurel_section_1.code}
    end

    assert_redirected_to '/'
    assert_equal(
      I18n.t(
        'follower.error.section_not_found',
        section_code: @laurel_section_1.code
      ),
      flash[:alert]
    )
  end

  test 'student_user_new errors when joining a provider_managed section' do
    sign_in @student
    section = CleverSection.from_service('1234', @chris.id, [], 'Test Clever Section')

    assert_does_not_create(Follower) do
      get :student_user_new, params: {section_code: section.code}
    end

    assert_redirected_to '/'
    expected = I18n.t('follower.error.provider_managed_section', provider: 'Clever')
    assert_equal(expected, flash[:alert])
  end

  test 'student_user_new errors when joing a section already at capacity' do
    sign_in @student
    section = create(:section, login_type: 'email')

    500.times do
      create(:follower, section: section)
    end

    assert_does_not_create(Follower) do
      get :student_user_new, params: {section_code: section.code}
    end

    assert_redirected_to '/join'
    expected = I18n.t('follower.error.full_section', section_code: section.code, section_capacity: section.capacity)
    assert_equal(expected, flash[:inline_alert])
  end

  test 'student_user_new errors when joining a restricted section' do
    sign_in @student
    section = create(:section, login_type: 'email', restrict_section: true)

    assert_does_not_create(Follower) do
      get :student_user_new, params: {section_code: section.code}
    end

    assert_redirected_to '/join'
    expected = I18n.t('follower.error.restricted_section', section_code: section.code)
    assert_equal(expected, flash[:inline_alert])
  end

  test "student_user_new does not allow joining your own section" do
    sign_in @chris

    assert_does_not_create(Follower) do
      get :student_user_new, params: {section_code: @chris_section.code}
    end

    assert_redirected_to '/'
    assert_equal "Sorry, you can't join your own section.", flash[:alert]
  end

  test 'student_user_new redirects admins to admin_directory' do
    sign_in @admin
    assert_does_not_create(Follower) do
      get :student_user_new, params: {section_code: @word_section.code}
    end

    assert_redirected_to admin_directory_path
  end

  test "student_register as teacher" do
    sign_out @laurel

    student_params = {email: 'teacher@school.edu',
                      name: "A name",
                      password: "apassword",
                      gender: 'F',
                      age: '13'}

    assert_creates(User, Follower) do
      post :student_register, params: {
        section_code: @chris_section.code,
        user: student_params
      }
    end

    assert_redirected_to '/'

    assert_equal 'A name', assigns(:user).name
    assert_equal 'F', assigns(:user).gender
    assert_equal Time.zone.now.to_date - 13.years, assigns(:user).birthday
    assert_equal AuthenticationOption::EMAIL, assigns(:user).primary_contact_info.credential_type
    assert_equal User::TYPE_STUDENT, assigns(:user).user_type
  end

  test "student_register with age and email" do
    Timecop.travel Time.local(2013, 9, 1, 12, 0, 0) do
      student_params = {email: 'student1@school.edu',
                        name: "A name",
                        password: "apassword",
                        gender: 'F',
                        age: '13'}

      assert_creates(User, Follower) do
        post :student_register, params: {
          section_code: @chris_section.code,
          user: student_params
        }
      end

      assert_redirected_to '/'

      assert_equal 'A name', assigns(:user).name
      assert_equal 'F', assigns(:user).gender
      assert_equal Date.today - 13.years, assigns(:user).birthday
      assert_equal AuthenticationOption::EMAIL, assigns(:user).primary_contact_info.credential_type
      assert_equal User::TYPE_STUDENT, assigns(:user).user_type
    end
  end

  test "student_register with age and hashed email" do
    Timecop.travel Time.local(2013, 9, 1, 12, 0, 0) do
      student_params = {hashed_email: User.hash_email('studentx@school.edu'),
                        name: "A name",
                        password: "apassword",
                        gender: 'F',
                        age: '11'}

      assert_creates(User, Follower) do
        post :student_register, params: {
          section_code: @chris_section.code,
          user: student_params
        }
      end

      assert_redirected_to '/'

      assert_equal 'A name', assigns(:user).name
      assert_equal 'F', assigns(:user).gender
      assert_equal Date.today - 11.years, assigns(:user).birthday
      assert_equal AuthenticationOption::EMAIL, assigns(:user).primary_contact_info.credential_type
      assert_equal '', assigns(:user).email
      assert_equal User.hash_email('studentx@school.edu'), assigns(:user).hashed_email
      assert_equal User::TYPE_STUDENT, assigns(:user).user_type
    end
  end

  test "student_register adds existing student to section if already signed in" do
    refute @chris_section.students.include? @student

    sign_in @student
    assert_does_not_create(User) do
      post :student_register, params: {section_code: @chris_section.code}
    end

    assert_redirected_to '/'
    @student.reload
    assert @chris_section.students.include? @student
  end

  test "student_register prompts user to create an account if not signed in" do
    assert_does_not_create(User, Follower) do
      post :student_register, params: {section_code: @chris_section.code}
    end

    assert_template 'followers/student_user_new'
    assert_select '#signup'
  end

  test "student_register with no section when signed in" do
    sign_in @student
    assert_does_not_create(User, Follower) do
      post :student_register, params: {section_code: ''}
    end

    assert_template 'followers/student_user_new'
    assert_select 'input#section_code'
  end

  test "student_register with no section when not signed in" do
    assert_does_not_create(User, Follower) do
      post :student_register, params: {section_code: ''}
    end

    assert_template 'followers/student_user_new'
    assert_select 'input#section_code'
  end

  test "student_register in section with script" do
    student_params = {email: 'student1@school.edu',
                      name: "A name",
                      password: "apassword",
                      gender: 'F',
                      age: '13'}

    assert_creates(User, Follower, UserScript) do
      post :student_register, params: {
        section_code: @laurel_section_script.code,
        user: student_params
      }
    end

    user_script = UserScript.where(user: assigns(:user), script: @laurel_section_script.script).first
    assert user_script
    assert user_script.assigned_at
    assert_equal @laurel_section_script.script, Queries::ScriptActivity.primary_student_unit(assigns(:user))
  end

  test "student_register with a picture/word section redirects to section login" do
    get :student_register, params: {section_code: @picture_section.code}
    assert_redirected_to controller: 'sections', action: 'show', id: @picture_section.code

    get :student_register, params: {section_code: @word_section.code}
    assert_redirected_to controller: 'sections', action: 'show', id: @word_section.code
  end

  test 'student_register errors when joining a provider_managed section' do
    sign_in @student
    section = create(:section, login_type: Section::LOGIN_TYPE_CLEVER)

    assert_does_not_create(User, Follower) do
      get :student_register, params: {section_code: section.code}
    end

    assert_redirected_to '/'
    expected = I18n.t('follower.error.provider_managed_section', provider: 'Clever')
    assert_equal(expected, flash[:alert])
  end

  test 'student_register errors when joining a section where user does not meet participant type' do
    sign_in @student
    section = create(:section, :facilitator_participants)

    assert_does_not_create(User, Follower) do
      get :student_register, params: {section_code: section.code}
    end

    assert_redirected_to '/'
    expected = I18n.t('follower.error.not_participant_type', section_code: section.code)
    assert_equal(expected, flash[:alert])
  end

  test 'student_register redirects admins to admin_directory' do
    sign_in @admin
    assert_does_not_create(User, Follower) do
      get :student_register, params: {section_code: @word_section.code}
    end

    assert_redirected_to admin_directory_path
  end

  test "student_user_new increments join section attempts when signed in" do
    refute @chris_section.students.include? @student
    sign_in @student
    section_join_attempts = @student.num_section_attempts
    assert_does_not_create(User) do
      post :student_register, params: {section_code: @chris_section.code}
    end
    @student.reload
    updated_section_join_attempts = @student.num_section_attempts
    change_in_section_attempts = updated_section_join_attempts - section_join_attempts
    assert_equal 1, change_in_section_attempts
  end

  test 'student_user_new displays captcha when joining 3 or more sections in 24 hours' do
    @new_student = create(:user)
    sign_in @new_student
    3.times do
      post :student_register, params: {section_code: 'INVALID'}
      @new_student.reload
    end
    assert_equal true, @new_student.display_captcha?
  end

  # Enable reCAPTCHA gem in test env for just this unit test.
  # Restores original configuration after testing the assertion
  test 'student_user_new displays error when joining 3 or more sections in 24 hours without completing captcha' do
    Recaptcha.configuration.skip_verify_env.delete("test")
    @new_student = create(:user)
    sign_in @new_student
    4.times do
      post :student_register, params: {section_code: @chris_section.code}
    end
    assert_equal(I18n.t('follower.captcha_required'), flash[:alert])
    Recaptcha.configuration.skip_verify_env.append("test")
  end
end
