require 'test_helper'

class TeacherDirectoryVerificationsControllerTest < ActionDispatch::IntegrationTest
  setup do
    TeacherDirectoryVerificationsController.layout false
  end

  teardown do
    TeacherDirectoryVerificationsController.layout nil
  end

  setup do
    @teacher = create(:teacher, :with_school_info)
    @token = SecureRandom.urlsafe_base64(32)
    @request_record = create_verification_request(@teacher, @token)
    DCDO.set('teacher_directory_verification_enabled', true)
    DCDO.set('teacher_directory_verification_zendesk_enabled', true)
  end

  test 'GET displays confirmation without changing request state' do
    sign_in @teacher

    get teacher_directory_verification_path(token: @token)

    assert_response :success
    assert_equal 'pending_confirmation', @request_record.reload.status
    assert_equal TeacherDirectoryVerificationRequest.digest_token(@token), @request_record.token_digest
    assert_no_enqueued_jobs
  end

  test 'POST confirms request and queues Zendesk handoff' do
    sign_in @teacher

    assert_enqueued_with(job: TeacherDirectoryVerification::CreateZendeskTicketJob, args: [@request_record.id]) do
      post submit_teacher_directory_verification_path(token: @token)
    end

    assert_response :success
    assert_equal 'submitted', @request_record.reload.status
    assert_nil @request_record.token_digest
    assert_nil @request_record.token_expires_at
  end

  test 'another account cannot open the confirmation link' do
    sign_in create(:teacher, :with_school_info)

    get teacher_directory_verification_path(token: @token)

    assert_response :not_found
  end

  test 'expired token cannot submit a request' do
    @request_record.update!(token_expires_at: 1.hour.ago)
    sign_in @teacher

    post submit_teacher_directory_verification_path(token: @token)

    assert_response :not_found
    assert_equal 'pending_confirmation', @request_record.reload.status
    assert_no_enqueued_jobs
  end

  test 'POST is unavailable while Zendesk submission is disabled' do
    DCDO.set('teacher_directory_verification_zendesk_enabled', false)
    sign_in @teacher

    post submit_teacher_directory_verification_path(token: @token)

    assert_response :service_unavailable
    assert_equal 'pending_confirmation', @request_record.reload.status
    assert_no_enqueued_jobs
  end

  private def create_verification_request(user, token)
    school = user.school_info.school
    user.teacher_directory_verification_requests.create!(
      school_id: school.id,
      school_name: school.name,
      email: user.email,
      status: 'pending_confirmation',
      evidence_url: 'https://school.example.edu/staff',
      evidence_email: user.email,
      token_digest: TeacherDirectoryVerificationRequest.digest_token(token),
      token_expires_at: 1.hour.from_now,
      ticket_external_id: SecureRandom.uuid,
      purge_after: 90.days.from_now,
    )
  end
end
