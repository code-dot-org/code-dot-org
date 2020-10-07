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
      return render :no_teacher_email unless current_user.email.present?

      @application = TEACHER_APPLICATION_CLASS.find_by(user: current_user)
      return render :submitted if @application

      @year = APPLICATION_CURRENT_YEAR

      @script_data = {
        props: {
          options: TEACHER_APPLICATION_CLASS.options.camelize_keys,
          requiredFields: TEACHER_APPLICATION_CLASS.camelize_required_fields,
          accountEmail: current_user.email,
          apiEndpoint: '/api/v1/pd/application/teacher',
          userId: current_user.id,
          schoolId: current_user.school_info&.school&.id
        }.to_json
      }
    end
  end
end
