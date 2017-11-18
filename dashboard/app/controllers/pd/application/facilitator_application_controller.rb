module Pd::Application
  class FacilitatorApplicationController < ApplicationController
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

      @application = Facilitator1819Application.find_by(user: current_user)
      return render :submitted if @application
      return render :closed unless Facilitator1819Application.open?

      @script_data = {
        props: {
          options: Facilitator1819Application.options.camelize_keys,
          requiredFields: Facilitator1819Application.camelize_required_fields,
          accountEmail: current_user.email,
          apiEndpoint: '/api/v1/pd/application/facilitator'
        }.to_json
      }
    end
  end
end
