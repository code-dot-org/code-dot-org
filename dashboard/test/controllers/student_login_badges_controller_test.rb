require 'test_helper'

class StudentLoginBadgesControllerTest < ActionController::TestCase
  setup do
    CDO.stubs(:student_badge_encryption_keys).returns({'1' => Base64.strict_encode64('a' * 32)})
    CDO.stubs(:student_badge_encryption_key_version).returns('1')
    Policies::StudentBadges.stubs(:authentication_enabled?).returns(true)
    Policies::StudentBadges.stubs(:issuance_enabled?).returns(true)
    @teacher = create(:teacher)
    @section = create(:section, user: @teacher, login_type: 'picture')
    @student = create(:student, :sponsored)
    create(:follower, section: @section, student_user: @student)
    sign_in @teacher
  end

  test 'issuance returns status only and reprint preserves the credential' do
    issue
    assert_response :success
    refute_includes response.body, 'badge_payload'
    badge = StudentLoginBadge.find_by!(user_id: @student.id)
    payload = badge.payload
    expiration = badge.expires_at
    2.times do
      post :print, params: {section_id: @section.id}, format: :json
      assert_response :success
      assert_equal payload, JSON.parse(response.body)['cards'].first['badge_payload']
      assert_includes response.headers['Cache-Control'], 'no-store'
    end
    assert_equal 1, badge.reload.generation
    assert_equal expiration, badge.expires_at
    get :index, params: {section_id: @section.id}, format: :json
    refute_includes response.body, payload
    refute_includes StudentLoginBadgeEvent.where(user_id: @student.id).to_json, payload
  end

  test 'another teacher cannot retrieve or replace badges' do
    issue
    sign_out @teacher
    sign_in create(:teacher)
    post :print, params: {section_id: @section.id}, format: :json
    assert_response :forbidden
    post :update, params: mutation('replace', 1), format: :json
    assert_response :forbidden
  end

  test 'removed students are no longer printable or manageable by former teachers' do
    issue
    Follower.where(section: @section, student_user: @student).destroy_all
    post :print, params: {section_id: @section.id}, format: :json
    assert_equal [], JSON.parse(response.body)['cards']
    assert_raises(ActiveRecord::RecordNotFound) do
      post :update, params: mutation('replace', 1), format: :json
    end
  end

  test 'student from another section cannot be issued a badge' do
    @student = create(:student, :sponsored)
    assert_no_difference 'StudentLoginBadge.count' do
      assert_raises(ActiveRecord::RecordNotFound) {issue}
    end
  end

  test 'independent accounts are not eligible for teacher management' do
    @student.update!(parent_email: 'parent@example.com', password: 'password123')
    refute @student.reload.teacher_managed_account?
    issue
    assert_response :forbidden
    assert_nil StudentLoginBadge.find_by(user_id: @student.id)
  end

  test 'demo sections cannot issue badges' do
    @section.update!(demo_type: 'elementary')
    issue
    assert_response :forbidden
    assert_nil StudentLoginBadge.find_by(user_id: @student.id)
  end

  test 'active co-teacher has authority and loses it after removal' do
    co_teacher = create(:teacher)
    instructor = create(:section_instructor, section: @section, instructor: co_teacher)
    sign_out @teacher
    sign_in co_teacher
    issue
    assert_response :success
    instructor.destroy!
    post :print, params: {section_id: @section.id}, format: :json
    assert_response :forbidden
  end

  test 'issuance pause permits reprint and revocation' do
    issue
    Policies::StudentBadges.stubs(:issuance_enabled?).returns(false)
    post :update, params: mutation('replace', 1), format: :json
    assert_response :forbidden
    post :print, params: {section_id: @section.id}, format: :json
    assert_response :success
    post :update, params: mutation('revoke', 1), format: :json
    assert_response :success
    assert StudentLoginBadge.find_by!(user_id: @student.id).revoked_at
  end

  test 'existing login can revoke only its own badge' do
    issue
    sign_out @teacher
    sign_in @student
    post :revoke_own, params: {generation: 1, request_id: SecureRandom.uuid, student_id: @teacher.id}, format: :json
    assert_response :success
    assert StudentLoginBadge.find_by!(user_id: @student.id).revoked_at
  end

  test 'badge login must reauthenticate before self revocation' do
    issue
    sign_out @teacher
    sign_in @student
    badge = StudentLoginBadge.find_by!(user_id: @student.id)
    session['student_badge'] = Services::StudentBadges::Session.provenance(badge)
    post :revoke_own, params: {generation: 1, request_id: SecureRandom.uuid}, format: :json
    assert_response :forbidden
    assert_nil badge.reload.revoked_at
  end

  test 'print requires csrf even though it does not rotate the credential' do
    issue
    ActionController::Base.allow_forgery_protection = true
    assert_raises(ActionController::InvalidAuthenticityToken) do
      post :print, params: {section_id: @section.id}, format: :json
    end
  ensure
    ActionController::Base.allow_forgery_protection = false
  end

  private def issue
    post :update, params: mutation('issue', 0), format: :json
  end

  private def mutation(operation, generation)
    {section_id: @section.id, student_id: @student.id, operation: operation,
     generation: generation, request_id: SecureRandom.uuid}
  end
end
