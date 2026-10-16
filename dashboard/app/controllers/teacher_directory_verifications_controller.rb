class TeacherDirectoryVerificationsController < ApplicationController
  before_action :authenticate_user!
  before_action :load_verification_request

  def show
    if @verification_request.status == 'submitted'
      render :submitted
    end
  end

  def create
    return head :service_unavailable unless zendesk_submission_enabled?
    return head :not_found unless @verification_request.confirm!(current_user)

    if @verification_request.zendesk_ticket_id.blank?
      job = TeacherDirectoryVerification::CreateZendeskTicketJob.perform_later(@verification_request.id)
      raise 'Teacher verification ticket job was not enqueued' unless job
    end
    @verification_request.consume_token!
    @verification_request.reload
    render :submitted
  rescue StandardError => exception
    Observability::Errors.report(
      exception,
      error_message: 'Could not queue teacher directory verification ticket',
      context: {verification_request_id: @verification_request.id},
    )
    render :show, status: :service_unavailable
  end

  private def zendesk_submission_enabled?
    DCDO.get('teacher_directory_verification_enabled', false) == true &&
      DCDO.get('teacher_directory_verification_zendesk_enabled', false) == true
  end

  private def load_verification_request
    @verification_request = TeacherDirectoryVerificationRequest.find_by_token(params[:token])
    return if @verification_request&.valid_for_user?(current_user)

    head :not_found
  end
end
