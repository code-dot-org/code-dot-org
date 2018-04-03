module Pd::Application
  class TeacherApplicationController < ApplicationController
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

      @application = Teacher1819Application.find_by(user: current_user)
      return render :submitted if @application

      @script_data = {
        props: {
          options: Teacher1819Application.options.camelize_keys,
          requiredFields: Teacher1819Application.camelize_required_fields,
          accountEmail: current_user.email,
          apiEndpoint: '/api/v1/pd/application/teacher'
        }.to_json
      }
    end
  end
end
