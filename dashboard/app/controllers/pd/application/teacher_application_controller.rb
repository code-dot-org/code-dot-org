module Pd::Application
  class TeacherApplicationController < ApplicationController
    include Pd::Application::ActiveApplicationModels

    # GET /pd/application/teacher
    def new
      # Block on production until we're ready to release and publicize the url
      # Allow workshop admins to preview
      if Rails.env.production? && !current_user.try(:workshop_admin?) && Gatekeeper.disallows('pd_teacher_application')
        return head :not_found
      end

      view_options(answerdash: true)

      return render :logged_out unless current_user
      return render :not_teacher unless current_user.teacher?
      return render :no_teacher_email if current_user.email.blank?

      @year = APPLICATION_CURRENT_YEAR

      @application = TEACHER_APPLICATION_CLASS.
                     where(application_year: @year).
                     find_by(user: current_user)
      if @application
        return render :submitted unless @application.status == 'incomplete' || @application.status == 'reopened'
        @application_id = @application.try(:id)
        @saved_status = @application.try(:status)
        @form_data = @application.try(:form_data)
      end

      @script_data = {
        props: {
          options: TEACHER_APPLICATION_CLASS.options.camelize_keys,
          requiredFields: TEACHER_APPLICATION_CLASS.camelize_required_fields,
          accountEmail: current_user.email,
          apiEndpoint: '/api/v1/pd/application/teacher',
          userId: current_user.id,
          schoolId: current_user.school_info&.school&.id,
          applicationId: @application_id,
          savedStatus: @saved_status,
          savedFormData: @form_data
        }.to_json
      }
    end
  end
end
