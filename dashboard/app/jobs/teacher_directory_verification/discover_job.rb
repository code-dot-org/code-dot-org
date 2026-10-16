require 'securerandom'

module TeacherDirectoryVerification
  class DiscoverJob < ApplicationJob
    queue_as :low

    def perform(user_id)
      return if Rails.env.development? || Rails.env.test?
      return unless Services::TeacherDirectoryVerification::Discovery.enabled?

      user = User.find_by(id: user_id)
      return unless Services::TeacherDirectoryVerification::Discovery.eligible_user?(user)
      return if user.teacher_directory_verification_requests.exists?(status: %w(pending_confirmation submitted))

      school = user.school_info.school
      email = user.email
      evidence = Services::TeacherDirectoryVerification::DirectoryLookup.call(school: school, email: email)
      return unless evidence

      user.reload
      return unless Services::TeacherDirectoryVerification::Discovery.eligible_user?(user)
      return unless user.email.casecmp?(email) && user.school_info.school_id.to_s == school.id.to_s

      token = SecureRandom.urlsafe_base64(32)
      verification_request = user.teacher_directory_verification_requests.create!(
        school_id: school.id,
        school_name: school.name,
        email: email,
        status: 'pending_confirmation',
        evidence_url: evidence.fetch(:url),
        evidence_title: evidence.fetch(:title),
        evidence_email: evidence.fetch(:email),
        token_digest: TeacherDirectoryVerificationRequest.digest_token(token),
        token_expires_at: 48.hours.from_now,
        ticket_external_id: SecureRandom.uuid,
        purge_after: TeacherDirectoryVerificationRequest::RETENTION_PERIOD.from_now,
      )

      begin
        TeacherMailer.teacher_directory_verification_email(user, school.name, token).deliver_now
      rescue StandardError
        verification_request.destroy!
        raise
      end

      begin
        purge_job = PurgeJob.set(wait_until: verification_request.purge_after).perform_later(verification_request.id)
        raise 'Teacher verification purge job was not enqueued' unless purge_job
      rescue StandardError => exception
        Observability::Errors.report(exception, error_message: 'Could not schedule teacher verification request purge')
      end
    end
  end
end
