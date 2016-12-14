class Api::V1::Pd::TeacherApplicationsController < ApplicationController
  authorize_resource class: 'Pd::TeacherApplication'

  def index
    @teacher_applications = ::Pd::TeacherApplication
    if params[:after_id]
      @teacher_applications = @teacher_applications.where('id > ?', params[:after_id])
    end

    expanded_results = @teacher_applications.all.map do |teacher_application|
      application_json = JSON.parse(teacher_application.application)
      school = School.find(application_json['school'])
      school_district = SchoolDistrict.find(application_json['school-district'])

      application_json.merge({
        id: teacher_application.id,
        userId: teacher_application.user_id,
        timestamp: teacher_application.created_at,
        schoolName: school.name,
        schoolDistrictName: school_district.name,
        regionalPartner: school_district.regional_partner.try(:name)
      }).stringify_keys
    end

    render json: expanded_results
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
      Pd::TeacherApplicationMailer.application_receipt(
        teacher_name: @teacher_application.teacher_name,
        teacher_email: @teacher_application.teacher_email
      ).deliver_now
      Pd::TeacherApplicationMailer.principal_approval_request(
        principal_prefix: @teacher_application.principal_prefix,
        principal_first_name: @teacher_application.principal_first_name,
        principal_last_name: @teacher_application.principal_last_name,
        principal_email: @teacher_application.principal_email,
        approval_form_url: @teacher_application.approval_form_url,
        teacher_name: @teacher_application.teacher_name,
        program_name: @teacher_application.program_name,
        program_url: @teacher_application.program_url,
      ).deliver_now
      head :no_content
    else
      render json: {errors: @teacher_application.errors.full_messages}, status: :bad_request
    end
  end
end
