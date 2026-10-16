module TeacherDirectoryVerification
  class CreateZendeskTicketJob < ApplicationJob
    queue_as :low

    retry_on StandardError, wait: :polynomially_longer, attempts: 5

    def perform(request_id)
      return unless DCDO.get('teacher_directory_verification_enabled', false) == true
      return unless DCDO.get('teacher_directory_verification_zendesk_enabled', false) == true
      return if Rails.env.development? || Rails.env.test?

      verification_request = TeacherDirectoryVerificationRequest.find_by(id: request_id)
      return unless verification_request

      verification_request.with_lock do
        next unless verification_request.status == 'submitted'
        next if verification_request.zendesk_ticket_id.present?
        next unless verification_request.eligible_for_ticket?(verification_request.user)

        ticket_id = Services::TeacherDirectoryVerification::TicketClient.create_for(verification_request)
        verification_request.update!(status: 'zendesk_created', zendesk_ticket_id: ticket_id)
      end
    end
  end
end
