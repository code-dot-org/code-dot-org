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

      @application = TEACHER_APPLICATION_CLASS.find_by(user: current_user)
      return render :submitted if @application

      options = TEACHER_APPLICATION_CLASS.options.camelize_keys

      school_id = current_user.school_info&.school&.id
      if school_id
        options[:school_id] = school_id
      end

      @script_data = {
        props: {
          options: options,
          requiredFields: TEACHER_APPLICATION_CLASS.camelize_required_fields,
          accountEmail: current_user.email,
          apiEndpoint: '/api/v1/pd/application/teacher',
          userId: current_user.id
        }.to_json
      }
    end
  end
end
