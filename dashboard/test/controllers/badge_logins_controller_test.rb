require 'test_helper'

class BadgeLoginsControllerTest < ActionController::TestCase
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
  end

  test 'valid badge creates a tracked session and local destination' do
    previous_sign_in_count = @student.sign_in_count
    post :create, params: {badge_payload: @badge.payload}, format: :json
    assert_response :success
    assert_equal @student.id, signed_in_user_id
    assert_equal @badge.id, session['student_badge']['id']
    assert_equal '/home', JSON.parse(response.body)['redirect']
    assert_includes response.headers['Cache-Control'], 'no-store'
    assert_equal previous_sign_in_count + 1, @student.reload.sign_in_count
  end

  test 'source rate limit prevents credential lookup' do
    Cdo::Throttle.stubs(:throttle).returns(true)
    StudentLoginBadge.expects(:authenticate).never
    post :create, params: {badge_payload: @badge.payload}, format: :json
    assert_response :too_many_requests
  end

  test 'a classroom behind one source address is not immediately throttled' do
    Cdo::Throttle.unstub(:throttle)
    CDO.stubs(:shared_cache).returns(ActiveSupport::Cache::MemoryStore.new)
    35.times do
      payload = "CDO1.#{SecureRandom.hex(16)}.1.#{'a' * 43}"
      post :create, params: {badge_payload: payload}, format: :json
      assert_response :unauthorized
    end
  end

  test 'login discards pairing and unchecked external return destination' do
    session[:pairings] = [@teacher.id]
    session[:user_return_to] = 'https://example.com'
    post :create, params: {badge_payload: @badge.payload, user_return_to: 'https://example.com'}, format: :json
    assert_response :success
    assert_nil session[:pairings]
    assert_nil session[:user_return_to]
    assert_equal '/home', JSON.parse(response.body)['redirect']
  end

  test 'current assignment is server-derived and removal falls back to home' do
    UnitGroup.stubs(:course_assignable?).returns(true)
    Unit.stubs(:course_assignable?).returns(true)
    course = create(:single_unit_course)
    @section.update!(course_id: course.id)
    post :create, params: {badge_payload: @badge.payload}, format: :json
    assert_equal course_path(course), JSON.parse(response.body)['redirect']
    post :switch
    Follower.where(section: @section, student_user: @student).destroy_all
    post :create, params: {badge_payload: @badge.payload}, format: :json
    assert_equal '/home', JSON.parse(response.body)['redirect']
  end

  test 'badge cannot silently replace a signed-in teacher' do
    sign_in @teacher
    post :create, params: {badge_payload: @badge.payload}, format: :json
    assert_response :conflict
    assert_equal @teacher.id, signed_in_user_id
  end

  test 'badge login clears this browser remember cookie without invalidating other devices' do
    @student.remember_me!
    remembered_at = @student.reload.remember_created_at
    cookies[:remember_user_token] = 'old-browser-cookie'
    post :create, params: {badge_payload: @badge.payload}, format: :json
    assert_response :success
    assert_equal remembered_at, @student.reload.remember_created_at
    assert_nil response.cookies['remember_user_token'].presence
  end

  test 'expired badge returns no identity' do
    payload = @badge.payload
    @badge.update!(expires_at: 1.minute.ago)
    post :create, params: {badge_payload: payload}, format: :json
    assert_response :unauthorized
    assert_equal({'error' => 'invalid_badge'}, JSON.parse(response.body))
    assert_nil signed_in_user_id
  end

  test 'csrf is required for authentication' do
    ActionController::Base.allow_forgery_protection = true
    assert_raises(ActionController::InvalidAuthenticityToken) do
      post :create, params: {badge_payload: @badge.payload}, format: :json
    end
  ensure
    ActionController::Base.allow_forgery_protection = false
  end

  test 'badge does not satisfy pending non-badge reauthentication' do
    session[:badge_reauthentication_user_id] = @student.id
    post :create, params: {badge_payload: @badge.payload}, format: :json
    assert_response :forbidden
    assert_nil signed_in_user_id
  end
end
