module Pd::Application
  class FacilitatorApplicationController < ApplicationController
    include Pd::Application::ActiveApplicationModels
    before_action do
      @facilitator_program_url = 'https://docs.google.com/document/d/1aX-KH-t6tgjGk2WyvJ7ik7alH4kFTlZ0s1DsrCRBq6U'
    end

    def new
      # Block on production until we're ready to release and publicize the url
      # TODO: Andrew - remove this, and the associated Gatekeeper key, after we go live
      if Rails.env.production? && !current_user.try(:workshop_admin?) && Gatekeeper.disallows('pd_facilitator_application')
        return head :not_found
      end

      return render :logged_out unless current_user
      return render :not_teacher unless current_user.teacher?

      @application = FACILITATOR_APPLICATION_CLASS.find_by(user: current_user)
      return render :submitted if @application
      return render :closed unless FACILITATOR_APPLICATION_CLASS.open? || params[:extend_deadline]

      @script_data = {
        props: {
          options: FACILITATOR_APPLICATION_CLASS.options.camelize_keys,
          requiredFields: FACILITATOR_APPLICATION_CLASS.camelize_required_fields,
          accountEmail: current_user.email,
          apiEndpoint: '/api/v1/pd/application/facilitator'
        }.to_json
      }
    end
  end
end
