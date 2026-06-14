require 'test_helper'

class Api::V1::Account::SettingsControllerTest < ActionController::TestCase
  # Secret material that must never appear in the response. 'password' alone is
  # excluded: it is a substring of allowlisted booleans like has_password.
  FORBIDDEN_KEYS = %w[
    properties oauth_token oauth_refresh_token hashed_email authentication_id
    encrypted_password secret_words secret_picture failed_attempts locked_at
  ].freeze

  test 'signed-in teacher gets a 200 with their allowlisted account settings' do
    teacher = create(:teacher, given_name: 'Ada', family_name: 'Lovelace', name: 'Ada Lovelace')
    sign_in teacher

    get :show

    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal 'teacher', body['user_type']
    assert_equal 'Ada', body['given_name']
    assert_equal 'Lovelace', body['family_name']
    assert_equal 'Ada Lovelace', body['display_name']
    assert_equal teacher.username, body['username']
    assert_equal teacher.email, body['email']
    assert_equal true, body['has_password']
    assert_equal false, body['should_see_add_password_form']
    assert body.key?('can_edit_email')
    assert body.key?('can_edit_password')
    assert body.key?('should_see_edit_email_link')
    assert body.key?('can_change_user_type')
    assert body.key?('can_delete_own_account')
    assert body.key?('authentication_options')
    assert body.key?('dependent_students_count')
  end

  test 'signed-in student gets age and us_state in their settings' do
    student = create(:student, birthday: Time.zone.today - 14.years, us_state: 'WA')
    sign_in student

    get :show

    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal 'student', body['user_type']
    assert_equal student.age, body['age']
    assert_equal 'WA', body['us_state']
  end

  test 'sso-only user reports no password and lists the oauth provider' do
    teacher = create(:teacher, :google_sso_provider)
    sign_in teacher

    get :show

    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal false, body['has_password']
    assert_equal true, body['should_see_add_password_form']
    credential_types = body['authentication_options'].map {|o| o['credential_type']}
    assert_includes credential_types, AuthenticationOption::GOOGLE
  end

  test 'authentication options expose only credential_type and email, never id or hashed_email' do
    teacher = create(:teacher, :with_google_authentication_option)
    sign_in teacher

    get :show

    body = JSON.parse(@response.body)
    option = body['authentication_options'].find {|o| o['credential_type'] == AuthenticationOption::GOOGLE}
    refute_nil option
    assert_equal %w[credential_type email].sort, option.keys.sort
  end

  test 'payload contains no tokens, credential ids, password hashes, or secret words' do
    # This fixture carries oauth tokens and a hashed_email; none may leak.
    teacher = create(:teacher, :with_google_authentication_option)
    sign_in teacher

    get :show

    raw = @response.body
    FORBIDDEN_KEYS.each do |key|
      refute_match(/#{Regexp.escape(key)}/, raw, "response leaked forbidden key/value: #{key}")
    end
    refute_match(/some-google-token/, raw, 'response leaked an oauth token')
    refute_includes raw, teacher.hashed_email if teacher.hashed_email.present?
  end

  test 'student without a cleartext email gets a masked (absent) email and no hashed_email' do
    student = create(:student_in_picture_section)
    sign_in student

    get :show

    body = JSON.parse(@response.body)
    assert_equal 'student', body['user_type']
    assert_nil body['email'], 'masked student email must be absent, not cleartext'
    refute_match(/hashed_email/, @response.body)
  end

  test 'response sets Cache-Control no-store' do
    sign_in create(:teacher)

    get :show

    assert_equal 'no-store', @response.headers['Cache-Control']
  end

  test 'signed-out request is rejected with 401 JSON, not an HTML redirect' do
    @request.headers['Accept'] = '*/*'

    get :show

    assert_response :unauthorized
    body = JSON.parse(@response.body)
    refute body.key?('user_type')
    refute body.key?('username')
    refute body.key?('email')
  end

  test 'reads only the current session user, ignoring any user id parameter' do
    teacher = create(:teacher, given_name: 'Self', family_name: 'Only')
    other = create(:teacher, given_name: 'Some', family_name: 'Else')
    sign_in teacher

    get :show, params: {user_id: other.id, id: other.id}

    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal 'Self', body['given_name']
    assert_equal teacher.username, body['username']
  end
end
