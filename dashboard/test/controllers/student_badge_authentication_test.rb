require 'test_helper'

class StudentBadgeAuthenticationTest < ActionDispatch::IntegrationTest
  setup do
    Policies::StudentBadges.stubs(:authentication_enabled?).returns(true)
    CDO.stubs(:student_badge_encryption_keys).returns({'1' => Base64.strict_encode64('a' * 32)})
    CDO.stubs(:student_badge_encryption_key_version).returns('1')
    Cdo::Throttle.stubs(:throttle).returns(false)
    @student = create(:student, :sponsored)
    @teacher = create(:teacher)
    @section = create(:section, user: @teacher, login_type: 'word')
    create(:follower, section: @section, student_user: @student)
    @badge = StudentLoginBadge.change!(student: @student, actor: @teacher, section: @section,
      operation: 'issue', expected_generation: 0, request_id: SecureRandom.uuid
    )
    post '/badge_login', params: {badge_payload: @badge.payload}, as: :json
    assert_response :success
  end

  test 'direct sensitive account mutations require alternate authentication' do
    [[:patch, '/users/parent_email'], [:patch, '/users/user_type'], [:patch, '/users/upgrade'],
     [:patch, '/users'], [:delete, '/users'], [:post, '/users/auth/1/disconnect'],
     [:delete, '/expire_other'], [:post, '/account/badge/revoke'],
     [:post, '/pd/attend/invalid/upgrade'], [:post, '/pd/attend/invalid/join'],
     [:post, '/pd/attend/invalid'], [:post, '/users/invitation'],
     [:get, '/discourse/sso']].each do |method, path|
      public_send(method, path, params: {user: {user_type: 'teacher', parent_email: 'attacker@example.com'}}, as: :json)
      assert_response :forbidden, path
      assert_equal 'badge_reauthentication_required', response.parsed_body['error'], path
    end
    assert @student.reload.student?
    assert_nil @student.parent_email
    refute @student.deleted?
  end

  test 'replacement rejects existing session on the next API request' do
    StudentLoginBadge.change!(student: @student, actor: @teacher, section: @section,
      operation: 'replace', expected_generation: 1, request_id: SecureRandom.uuid
    )
    get '/api/v1/users/current', as: :json
    assert_response :unauthorized
    assert_equal 'badge_session_expired', response.parsed_body['error']
  end

  test 'explicit switch signs out before another badge is accepted' do
    post '/badge_login/switch'
    assert_response :see_other
    get '/api/v1/users/current', as: :json
    assert_equal false, response.parsed_body['is_signed_in']
    post '/badge_login', params: {badge_payload: @badge.payload}, as: :json
    assert_response :success
  end

  test 'ordinary requests do not refresh the idle clock' do
    travel 2.hours do
      get '/api/v1/users/current', as: :json
      assert_response :unauthorized
    end
  end

  test 'a login that verified before replacement cannot authorize a later request' do
    post '/badge_login/switch'
    payload = @badge.payload
    StudentLoginBadge.change!(
      student: @student, actor: @teacher, section: @section, operation: 'replace',
      expected_generation: 1, request_id: SecureRandom.uuid
    )
    StudentLoginBadge.stubs(:authenticate).returns(@badge)
    post '/badge_login', params: {badge_payload: payload}, as: :json
    assert_response :success
    get '/api/v1/users/current', as: :json
    assert_response :unauthorized
  end

  test 'revocation leaves a separate native session valid' do
    native = open_session
    native.host! CDO.dashboard_hostname
    native.https!
    native.post "/sections/#{@section.code}/log_in", params: {user_id: @student.id, secret_words: @student.secret_words}
    native.assert_response :redirect
    StudentLoginBadge.change!(
      student: @student, actor: @teacher, section: @section, operation: 'revoke',
      expected_generation: 1, request_id: SecureRandom.uuid
    )
    native.get '/api/v1/users/current', as: :json
    assert_equal @student.id, native.response.parsed_body['id']
    get '/api/v1/users/current', as: :json
    assert_response :unauthorized
  end

  test 'child account lockout still applies and permits explicit badge sign-out' do
    Services::ChildAccount::LockoutHandler.stubs(:call).returns(true)
    get '/home'
    assert_redirected_to lockout_path
    post '/badge_login/switch'
    assert_response :see_other
    get '/api/v1/users/current', as: :json
    assert_equal false, response.parsed_body['is_signed_in']
  end

  test 'reauthentication requires the original account with section credentials' do
    post '/badge_login/reauthenticate'
    assert_response :see_other
    post '/badge_login', params: {badge_payload: @badge.payload}, as: :json
    assert_response :forbidden
    other = create(:student, :sponsored)
    create(:follower, section: @section, student_user: other)
    post "/sections/#{@section.code}/log_in", params: {user_id: other.id, secret_words: other.secret_words}
    assert_response :redirect
    get '/api/v1/users/current', as: :json
    assert_equal false, response.parsed_body['is_signed_in']
    post "/sections/#{@section.code}/log_in", params: {user_id: @student.id, secret_words: @student.secret_words}
    assert_redirected_to edit_user_registration_path
    get '/api/v1/users/current', as: :json
    assert_equal @student.id, response.parsed_body['id']
    post '/account/badge/revoke', params: {generation: 1, request_id: SecureRandom.uuid}, as: :json
    assert_response :success
  end
end
