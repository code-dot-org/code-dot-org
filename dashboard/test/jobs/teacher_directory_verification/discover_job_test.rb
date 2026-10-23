require 'test_helper'

class TeacherDirectoryVerification::DiscoverJobTest < ActiveJob::TestCase
  setup do
    set_env :production
    Services::TeacherDirectoryVerification::Discovery::FEATURE_FLAGS.each do |flag|
      DCDO.set(flag, true)
    end
    @teacher = create(:teacher, :with_school_info)
  end

  test 'stores matched evidence and emails a one-time token' do
    school = @teacher.school_info.school
    evidence = {
      url: 'https://school.example.edu/staff',
      title: 'Staff directory',
      email: @teacher.email,
    }
    token = nil
    mail = mock
    mail.expects(:deliver_now).once

    Services::TeacherDirectoryVerification::DirectoryLookup.
      expects(:call).
      with(school: school, email: @teacher.email).
      returns(evidence)
    TeacherMailer.expects(:teacher_directory_verification_email).with do |teacher, school_name, email_token|
      token = email_token
      teacher == @teacher && school_name == school.name && email_token.present?
    end.returns(mail)

    assert_difference('TeacherDirectoryVerificationRequest.count', 1) do
      TeacherDirectoryVerification::DiscoverJob.perform_now(@teacher.id)
    end

    request = @teacher.teacher_directory_verification_requests.sole
    assert_equal 'pending_confirmation', request.status
    assert_equal evidence[:url], request.evidence_url
    assert_equal TeacherDirectoryVerificationRequest.digest_token(token), request.token_digest
    assert request.token_expires_at.future?
  end

  test 'does not call the directory when feature flags are disabled' do
    DCDO.set('teacher_directory_verification_email_enabled', false)
    Services::TeacherDirectoryVerification::DirectoryLookup.expects(:call).never

    TeacherDirectoryVerification::DiscoverJob.perform_now(@teacher.id)

    assert_empty @teacher.teacher_directory_verification_requests
  end

  test 'does not repeat discovery while a request is pending' do
    create_verification_request
    Services::TeacherDirectoryVerification::DirectoryLookup.expects(:call).never

    TeacherDirectoryVerification::DiscoverJob.perform_now(@teacher.id)

    assert_equal 1, @teacher.teacher_directory_verification_requests.count
  end

  private def create_verification_request
    school = @teacher.school_info.school
    @teacher.teacher_directory_verification_requests.create!(
      school_id: school.id,
      school_name: school.name,
      email: @teacher.email,
      status: 'pending_confirmation',
      evidence_url: 'https://school.example.edu/staff',
      evidence_email: @teacher.email,
      token_digest: TeacherDirectoryVerificationRequest.digest_token('existing-token'),
      token_expires_at: 1.hour.from_now,
      ticket_external_id: SecureRandom.uuid,
      purge_after: 90.days.from_now,
    )
  end
end
