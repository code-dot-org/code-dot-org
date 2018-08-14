module Pd::Application
  class TeacherApplicationController < ApplicationController
    APPLICATION_CLASS = Teacher1819Application

    # GET /pd/application/teacher
    def new
      # Block on production until we're ready to release and publicize the url
      # TODO: Andrew - remove this, and the associated Gatekeeper key, after we go live
      if Rails.env.production? && !current_user.try(:workshop_admin?) && Gatekeeper.disallows('pd_teacher_application')
        return head :not_found
      end

      view_options(answerdash: true)

      return render :logged_out unless current_user
      return render :not_teacher unless current_user.teacher?

      @application = APPLICATION_CLASS.find_by(user: current_user)
      return render :submitted if @application

      @script_data = {
        props: {
          options: APPLICATION_CLASS.options.camelize_keys,
          requiredFields: APPLICATION_CLASS.camelize_required_fields,
          accountEmail: current_user.email,
          apiEndpoint: '/api/v1/pd/application/teacher'
        }.to_json
      }
    end

    # Temporary preview
    # GET /pd/application/teacher_1920_preview
    def new_1920_preview
      return render_404 unless current_user&.workshop_admin?

      view_options(answerdash: true)

      @script_data = {
        props: {
          options: APPLICATION_CLASS.options.camelize_keys,
          requiredFields: APPLICATION_CLASS.camelize_required_fields,
          accountEmail: current_user.email,
          apiEndpoint: nil
        }.to_json
      }
    end
  end
end
