class Api::V1::Pd::TeacherApplicationsController < ApplicationController
  authorize_resource class: 'Pd::TeacherApplication'

  def index
    @teacher_applications = ::Pd::TeacherApplication
    if params[:after_id]
      @teacher_applications = @teacher_applications.where('id > ?', params[:after_id])
    end

    render json: @teacher_applications.all.map(&:to_expanded_json)
  end

  def create
    application_params = params.require(:application)
    application_json = application_params.to_unsafe_h.to_json

    # Set user, and extract the personal and school emails.
    # Otherwise the teacher application JSON is saved as provided.
    @teacher_application = ::Pd::TeacherApplication.new(
      user: current_user,
      primary_email: application_params.require(:primaryEmail),
      secondary_email: application_params.require(:secondaryEmail),
      application: application_json
    )

    if @teacher_application.save
      head :no_content
    else
      render json: {errors: @teacher_application.errors.full_messages}, status: :bad_request
    end
  end
end
