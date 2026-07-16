require 'test_helper'

class Api::V1::Users::SettingsControllerTest < ActionDispatch::IntegrationTest
  # Secret material that must never appear in the response. 'password' alone is
  # excluded: it is a substring of allowlisted booleans like has_password.
  FORBIDDEN_KEYS = %w[
    properties oauth_token oauth_refresh_token hashed_email authentication_id
    encrypted_password secret_words secret_picture failed_attempts locked_at
  ].freeze

  describe 'GET /api/v1/users/me/settings' do
    subject(:get_settings) {get api_v1_users_settings_path}

    let(:body) {JSON.parse(response.body)}

    context 'when signed out' do
      it 'is rejected with 401 JSON, not an HTML redirect' do
        get api_v1_users_settings_path, headers: {'Accept' => '*/*'}

        must_respond_with :unauthorized
        _(body.key?('user_type')).must_equal false
        _(body.key?('username')).must_equal false
        _(body.key?('email')).must_equal false
      end
    end

    context 'when signed in as a teacher' do
      let(:user) {create(:teacher, given_name: 'Ada', family_name: 'Lovelace', name: 'Ada Lovelace')}

      before {sign_in user}

      it 'returns 200 with the allowlisted account settings' do
        get_settings

        must_respond_with :success
        _(body['user_type']).must_equal 'teacher'
        _(body['given_name']).must_equal 'Ada'
        _(body['family_name']).must_equal 'Lovelace'
        _(body['display_name']).must_equal 'Ada Lovelace'
        _(body['username']).must_equal user.username
        _(body['email']).must_equal user.email
        _(body['has_password']).must_equal true
        _(body['should_see_add_password_form']).must_equal false
        _(body).must_include 'can_edit_email'
        _(body).must_include 'can_edit_password'
        _(body).must_include 'should_see_edit_email_link'
        _(body).must_include 'can_change_user_type'
        _(body).must_include 'can_delete_own_account'
        _(body).must_include 'authentication_options'
        _(body).must_include 'dependent_students_count'
        _(body).must_include 'gender'
        _([true, false]).must_include body['is_usa']
      end

      it 'sets Cache-Control no-store' do
        get_settings

        _(response.headers['Cache-Control']).must_include 'no-store'
      end
    end

    context 'when signed in as a student' do
      let(:user) {create(:student, birthday: Time.zone.today - 14.years, us_state: 'WA')}

      before {sign_in user}

      it 'includes age and us_state' do
        get_settings

        must_respond_with :success
        _(body['user_type']).must_equal 'student'
        _(body['age']).must_equal user.age
        _(body['us_state']).must_equal 'WA'
      end

      it 'round-trips the student gender input' do
        user.update!(gender_student_input: 'Nonbinary')

        get_settings

        _(body['gender']).must_equal 'Nonbinary'
      end
    end

    context 'dropdown option lists' do
      before {sign_in create(:student)}

      it 'include the age and US-state options' do
        get_settings

        age_values = body['age_options'].map {|o| o['value']}
        _(age_values.first).must_equal '4'
        _(age_values).must_include '21+'

        states = body['us_state_options']
        _(states.first['value']).must_equal '??', "the 'not listed' option leads the list"
        _(states).must_include({'value' => 'DC', 'text' => 'Washington, D.C.'})
        _(states).must_include({'value' => 'WA', 'text' => 'Washington'})
      end
    end

    context 'parent email' do
      it 'is present when the student has one' do
        sign_in create(:student, parent_email: 'parent@example.com')

        get_settings

        _(body['parent_email']).must_equal 'parent@example.com'
      end

      it 'is absent when none is set' do
        sign_in create(:student)

        get_settings

        _(body['parent_email']).must_be_nil
      end
    end

    context 'when signed in as an SSO-only teacher' do
      let(:user) {create(:teacher, :google_sso_provider)}

      before {sign_in user}

      it 'reports no password and lists the oauth provider' do
        get_settings

        must_respond_with :success
        _(body['has_password']).must_equal false
        _(body['should_see_add_password_form']).must_equal true
        credential_types = body['authentication_options'].map {|o| o['credential_type']}
        _(credential_types).must_include AuthenticationOption::GOOGLE
      end
    end

    context 'when the teacher has a google authentication option' do
      let(:user) {create(:teacher, :with_google_authentication_option)}

      before {sign_in user}

      it 'exposes only credential_type and email, never id or hashed_email' do
        get_settings

        option = body['authentication_options'].find {|o| o['credential_type'] == AuthenticationOption::GOOGLE}
        _(option).wont_be_nil
        _(option.keys.sort).must_equal %w[credential_type email].sort
      end

      it 'leaks no tokens, credential ids, password hashes, or secret words' do
        get_settings

        raw = response.body
        FORBIDDEN_KEYS.each do |key|
          _(raw).wont_match(/#{Regexp.escape(key)}/, "response leaked forbidden key/value: #{key}")
        end
        _(raw).wont_match(/some-google-token/, 'response leaked an oauth token')
        _(raw).wont_include user.hashed_email if user.hashed_email.present?
      end
    end

    context 'when signed in as a student without a cleartext email' do
      let(:user) {create(:student_in_picture_section)}

      before {sign_in user}

      it 'masks the email (absent) and exposes no hashed_email' do
        get_settings

        _(body['user_type']).must_equal 'student'
        _(body['email']).must_be_nil 'masked student email must be absent, not cleartext'
        _(response.body).wont_match(/hashed_email/)
      end
    end

    context 'horizontal access control' do
      it 'reads only the current session user, ignoring any user id parameter' do
        user = create(:teacher, given_name: 'Self', family_name: 'Only')
        other = create(:teacher, given_name: 'Some', family_name: 'Else')
        sign_in user

        get api_v1_users_settings_path, params: {user_id: other.id, id: other.id}

        must_respond_with :success
        _(body['given_name']).must_equal 'Self'
        _(body['username']).must_equal user.username
      end

      it 'gives each signed-in user only their own settings' do
        alice = create(:teacher, given_name: 'Alice', name: 'Alice A')
        bob = create(:teacher, given_name: 'Bob', name: 'Bob B')

        sign_in alice
        get api_v1_users_settings_path
        alice_body = JSON.parse(response.body)
        _(alice_body['given_name']).must_equal 'Alice'
        _(alice_body['username']).must_equal alice.username

        sign_out alice
        sign_in bob
        get api_v1_users_settings_path
        bob_body = JSON.parse(response.body)
        _(bob_body['given_name']).must_equal 'Bob'
        _(bob_body['username']).must_equal bob.username

        _(bob_body['username']).wont_equal alice.username
      end
    end
  end
end
