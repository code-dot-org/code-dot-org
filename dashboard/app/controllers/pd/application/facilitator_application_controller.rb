module Pd::Application
  class FacilitatorApplicationController < ApplicationController
    include Pd::Application::ActiveApplicationModels
    include Pd::FacilitatorCommonApplicationConstants
    before_action do
      @facilitator_program_url = 'https://code.org/files/facilitator/overview-2019-20.pdf'
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
      if @application
        @display_regional_partner_reminder = regional_partner_support?
        return render :submitted
      end

      return render :closed unless FACILITATOR_APPLICATION_CLASS.open? || params[:extend_deadline]

      @unit_data = {
        props: {
          options: FACILITATOR_APPLICATION_CLASS.options.camelize_keys,
          requiredFields: FACILITATOR_APPLICATION_CLASS.camelize_required_fields,
          accountEmail: current_user.email,
          apiEndpoint: '/api/v1/pd/application/facilitator'
        }.to_json
      }
    end

    private

    def regional_partner_support?
      unless @application.regional_partner
        return false
      end
      if @application.course == 'csf' && !@application.regional_partner.has_csf
        return false
      end
      true
    end
  end
end
