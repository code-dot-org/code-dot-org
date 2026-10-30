require 'test_helper'

class AuthenticationOptionsControllerTest < ActionDispatch::IntegrationTest
  test 'disconnect: redirects with an error message if user is not signed in' do
    post '/users/auth/1/disconnect'
    assert_includes(flash[:alert], 'Sorry')
    assert_response :redirect
  end

  test 'disconnect: destroys the AuthenticationOption if it exists and is not primary' do
    user = create(:user)
    auth_option = create(:authentication_option, user: user)
    sign_in user

    assert_destroys(AuthenticationOption) do
      post "/users/auth/#{auth_option.id}/disconnect"
      assert_includes(flash[:notice], "Success!")
      assert_response :redirect
      assert_raises ActiveRecord::RecordNotFound do
        AuthenticationOption.find(auth_option.id)
      end
    end
  end

  test 'disconnect: if the removed AuthenticationOption was primary and a replacement is available, replaces it' do
    email = random_email
    teacher = create(:teacher)
    google_option = create(:google_authentication_option, user: teacher, email: email)
    facebook_option = create(:facebook_authentication_option, user: teacher, email: email)
    teacher.update(primary_contact_info: google_option)
    teacher.reload

    # Preconditions
    assert_equal 3, teacher.authentication_options.size
    assert_includes teacher.authentication_options, google_option
    assert_includes teacher.authentication_options, facebook_option
    assert_equal google_option, teacher.primary_contact_info

    sign_in teacher
    post "/users/auth/#{teacher.primary_contact_info_id}/disconnect"
    assert_includes(flash[:notice], "Success!")
    assert_response :redirect

    teacher.reload
    assert_equal 2, teacher.authentication_options.size
    refute_includes teacher.authentication_options, google_option
    assert_includes teacher.authentication_options, facebook_option
    assert_equal facebook_option, teacher.primary_contact_info
  end

  test 'disconnect: if the removed AuthenticationOption was primary and no replacement is available, creates one' do
    email = random_email
    teacher = create(:teacher)
    google_option = create(:google_authentication_option, user: teacher, email: email)
    teacher.update(primary_contact_info: google_option)
    teacher.reload

    # Preconditions
    assert_equal 2, teacher.authentication_options.size
    assert_includes teacher.authentication_options, google_option
    assert_equal google_option, teacher.primary_contact_info
    refute_empty teacher.encrypted_password

    sign_in teacher
    post "/users/auth/#{teacher.primary_contact_info_id}/disconnect"
    assert_includes(flash[:notice], "Success!")
    assert_response :redirect

    teacher.reload
    assert_equal 2, teacher.authentication_options.size
    refute_includes teacher.authentication_options, google_option
    assert_authentication_option teacher.primary_contact_info,
      user: teacher,
      email: email,
      hashed_email: User.hash_email(email),
      credential_type: AuthenticationOption::EMAIL,
      authentication_id: User.hash_email(email)
  end

  test 'disconnect: removes every ClassLink option when one of them is disconnected' do
    teacher = create(:teacher)
    v1_option = create_versioned_option(teacher, AuthenticationOption::CLASSLINK, version: nil, authentication_id: classlink_v1_id)
    v2_option = create_versioned_option(teacher, AuthenticationOption::CLASSLINK, version: AuthenticationOption::Classlink::VERSION[:v2], authentication_id: classlink_v2_id)
    google_option = create(:google_authentication_option, user: teacher, email: teacher.email)
    teacher.reload

    # Preconditions
    assert_equal 4, teacher.authentication_options.size

    sign_in teacher
    post "/users/auth/#{v2_option.id}/disconnect"
    assert_includes(flash[:notice], "Success!")
    assert_response :redirect

    teacher.reload
    assert_equal 2, teacher.authentication_options.size
    refute_includes teacher.authentication_options, v1_option
    refute_includes teacher.authentication_options, v2_option
    assert_includes teacher.authentication_options, google_option
  end

  test 'disconnect: replaces primary_contact_info when it was a hidden ClassLink option' do
    email = random_email
    teacher = create(:teacher, email: email)
    v1_option = create_versioned_option(teacher, AuthenticationOption::CLASSLINK, version: nil, authentication_id: classlink_v1_id)
    v2_option = create_versioned_option(teacher, AuthenticationOption::CLASSLINK, version: AuthenticationOption::Classlink::VERSION[:v2], authentication_id: classlink_v2_id)
    teacher.update(primary_contact_info: v1_option)
    teacher.reload

    # Preconditions
    assert_equal v1_option, teacher.primary_contact_info

    sign_in teacher
    post "/users/auth/#{v2_option.id}/disconnect"
    assert_response :redirect

    teacher.reload
    refute_includes teacher.authentication_options, v1_option
    refute_includes teacher.authentication_options, v2_option
    assert_authentication_option teacher.primary_contact_info,
      user: teacher,
      email: email,
      hashed_email: User.hash_email(email),
      credential_type: AuthenticationOption::EMAIL,
      authentication_id: User.hash_email(email)
  end

  test 'disconnect: removes every Clever option when one of them is disconnected' do
    teacher = create(:teacher)
    pre_v3_option = create_versioned_option(teacher, AuthenticationOption::CLEVER, version: nil, authentication_id: SecureRandom.uuid)
    v3_option = create_versioned_option(teacher, AuthenticationOption::CLEVER, version: AuthenticationOption::Clever::VERSION[:v3], authentication_id: SecureRandom.uuid)
    classlink_option = create_versioned_option(teacher, AuthenticationOption::CLASSLINK, version: nil, authentication_id: classlink_v1_id)
    teacher.reload

    sign_in teacher
    post "/users/auth/#{v3_option.id}/disconnect"
    assert_includes(flash[:notice], "Success!")
    assert_response :redirect

    teacher.reload
    refute_includes teacher.authentication_options, pre_v3_option
    refute_includes teacher.authentication_options, v3_option
    assert_includes teacher.authentication_options, classlink_option
  end

  test 'disconnect: leaves other providers alone when disconnecting a Google option' do
    teacher = create(:teacher)
    classlink_option = create_versioned_option(teacher, AuthenticationOption::CLASSLINK, version: nil, authentication_id: classlink_v1_id)
    google_option = create(:google_authentication_option, user: teacher, email: teacher.email)
    teacher.reload

    sign_in teacher
    post "/users/auth/#{google_option.id}/disconnect"
    assert_response :redirect

    teacher.reload
    refute_includes teacher.authentication_options, google_option
    assert_includes teacher.authentication_options, classlink_option
  end

  test 'disconnect: a ClassLink student with no email falls back to a remaining option as primary' do
    student = create(:student, :without_email_auth_option)
    pre_v2_option = create_blank_email_option(student, AuthenticationOption::CLASSLINK, version: nil)
    v2_option = create_blank_email_option(student, AuthenticationOption::CLASSLINK, version: AuthenticationOption::Classlink::VERSION[:v2])
    google_option = create(:google_authentication_option, user: student, email: random_email)
    student.update!(primary_contact_info: v2_option)
    blank_email_option_for_another_user
    student.reload

    # Preconditions
    assert_equal '', v2_option.hashed_email
    assert_equal v2_option, student.primary_contact_info

    sign_in student
    post "/users/auth/#{v2_option.id}/disconnect"
    assert_includes(flash[:notice], "Success!")
    assert_response :redirect

    student.reload
    refute_includes student.authentication_options, pre_v2_option
    refute_includes student.authentication_options, v2_option
    assert_equal [google_option], student.authentication_options.to_a
    assert_equal google_option, student.primary_contact_info
  end

  test 'disconnect: a Clever student with no email and a single Clever option falls back to a remaining option as primary' do
    student = create(:student, :without_email_auth_option)
    clever_option = create_blank_email_option(student, AuthenticationOption::CLEVER, version: AuthenticationOption::Clever::VERSION[:v3])
    google_option = create(:google_authentication_option, user: student, email: random_email)
    student.update!(primary_contact_info: clever_option)
    blank_email_option_for_another_user
    student.reload

    sign_in student
    post "/users/auth/#{clever_option.id}/disconnect"
    assert_includes(flash[:notice], "Success!")
    assert_response :redirect

    student.reload
    assert_equal [google_option], student.authentication_options.to_a
    assert_equal google_option, student.primary_contact_info
  end

  test 'disconnect: a Clever student with no email and no other option is left without a primary_contact_info' do
    student = create(:student, :without_email_auth_option)
    clever_option = create_blank_email_option(student, AuthenticationOption::CLEVER, version: AuthenticationOption::Clever::VERSION[:v3])
    student.update!(primary_contact_info: clever_option)
    blank_email_option_for_another_user
    student.reload

    sign_in student
    post "/users/auth/#{clever_option.id}/disconnect"
    assert_includes(flash[:notice], "Success!")
    assert_response :redirect

    student.reload
    assert_empty student.authentication_options
    assert_nil student.primary_contact_info
  end

  test 'disconnect: keeps every option and shows an alert when the replacement email option is already taken' do
    email = random_email
    create(:teacher, email: email)
    teacher = create(:teacher)
    clever_option = create_versioned_option(teacher, AuthenticationOption::CLEVER, version: AuthenticationOption::Clever::VERSION[:v3], authentication_id: SecureRandom.uuid, email: email)
    teacher.update!(primary_contact_info: clever_option)
    teacher.reload
    options_before = teacher.authentication_options.to_a

    sign_in teacher
    post "/users/auth/#{clever_option.id}/disconnect"
    assert_equal I18n.t('auth.disconnect_failed'), flash[:alert]
    assert_nil flash[:notice]
    assert_redirected_to edit_user_registration_path

    teacher.reload
    assert_equal options_before.sort_by(&:id), teacher.authentication_options.sort_by(&:id)
    assert_equal clever_option, teacher.primary_contact_info
  end

  test 'disconnect: returns not_found if the AuthenticationOption does not exist' do
    user = create(:user)
    sign_in user

    assert_does_not_destroy(AuthenticationOption) do
      post "/users/auth/1/disconnect"
      assert_response :not_found
    end
  end

  test 'disconnect: returns not_found if the AuthenticationOption does not belong to the current user' do
    user = create(:user)
    auth_option = create(:authentication_option)
    sign_in user

    assert_does_not_destroy(AuthenticationOption) do
      post "/users/auth/#{auth_option.id}/disconnect"
      assert_response :not_found
    end
  end

  private def create_versioned_option(user, credential_type, version:, authentication_id:, email: user.email)
    create(
      :authentication_option,
      user: user,
      email: email,
      hashed_email: User.hash_email(email),
      credential_type: credential_type,
      authentication_id: authentication_id,
      version: version
    )
  end

  # Create an auth option with blank email and hashed email to simulate
  # ClassLink or Clever sign-ups, or an email auth option created to match an email
  # address from Clever or Classlink.
  private def create_blank_email_option(user, credential_type, version:)
    create(
      :authentication_option,
      user: user,
      email: '',
      hashed_email: '',
      credential_type: credential_type,
      authentication_id: SecureRandom.uuid,
      version: version
    )
  end

  # The EMAIL option with a blank authentication_id that a disconnect used to
  # synthesize for students without an email. Only one can exist per database,
  # so reuse one left behind by an earlier test run rather than fail creating it.
  private def blank_email_option_for_another_user
    AuthenticationOption.find_by(credential_type: AuthenticationOption::EMAIL, authentication_id: '') ||
      create(:authentication_option, user: create(:student, :without_email_auth_option), email: '', hashed_email: '')
  end

  private def random_email
    "#{SecureRandom.uuid}@example.com"
  end

  private def classlink_v1_id
    rand(10_000_000..99_999_999).to_s
  end

  private def classlink_v2_id
    "#{SecureRandom.uuid}|#{SecureRandom.uuid}"
  end
end
