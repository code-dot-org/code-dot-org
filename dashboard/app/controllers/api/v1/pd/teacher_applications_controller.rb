class Api::V1::Pd::TeacherApplicationsController < ApplicationController
  authorize_resource class: 'Pd::TeacherApplication'

  def index
    @teacher_applications = Pd::TeacherApplication.all
    render json: @teacher_applications.pluck(:application)
  end

  def create
    # Set user, and extract the personal and school emails.
    # Otherwise the teacher application JSON is saved as provided.
    @teacher_application = Pd::TeacherApplication.new(
      user: current_user,
      personal_email: params[:personalEmail],
      school_email: params[:schoolEmail],
      application: params
    )
    if @teacher_application.save
      head :no_content
    else
      render json: {errors: @teacher_application.errors.full_messages}, status: :bad_request
    end
  end
end
