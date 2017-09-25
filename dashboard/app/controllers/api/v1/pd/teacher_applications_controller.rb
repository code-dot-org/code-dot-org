class Api::V1::Pd::TeacherApplicationsController < ApplicationController
  authorize_resource class: 'Pd::TeacherApplication', only: :create

  def index
    # Require workshop admin or a matching secret_key param
    unless current_user.try(:permission?, UserPermission::WORKSHOP_ADMIN)
      secret_key = CDO.pd_teacher_application_list_secret_key
      unless secret_key && secret_key == params[:secret_key]
        render_404
        return
      end
    end

    @teacher_applications = ::Pd::TeacherApplication
    if params[:after_id]
      @teacher_applications = @teacher_applications.where('id > ?', params[:after_id])
    end

    render json: @teacher_applications.all.map(&:to_expanded_json)
  end

  def create
    application_params = params.require(:application)
    application_json = application_params.to_unsafe_h.to_json.strip_utf8mb4

    # The teacher application JSON is saved as provided.
    # The model parses it, extracts and validates required fields.
    @teacher_application = ::Pd::TeacherApplication.new(
      user: current_user,
      application_json: application_json
    )

    begin
      @teacher_application.save
    rescue
      # Fail silently - this happens in the event of multiple submission
      CDO.log.warn "Duplicate pd teacher application submission for user #{current_user.id} - ignoring the second one"
      head :no_content
      return
    end

    if @teacher_application.persisted?
      Pd::TeacherApplicationMailer.application_receipt(@teacher_application).deliver_now
      Pd::TeacherApplicationMailer.principal_approval_request(@teacher_application).deliver_now
      head :no_content
    else
      render json: {errors: @teacher_application.errors.full_messages}, status: :bad_request
    end
  end
end
