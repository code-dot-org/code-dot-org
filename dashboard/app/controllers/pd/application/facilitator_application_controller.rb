module Pd::Application
  class FacilitatorApplicationController < ApplicationController
    load_and_authorize_resource :facilitator_application, class: 'Pd::Application::Facilitator1819Application'

    def new
      return render :submitted if Facilitator1819Application.exists?(user: current_user)

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
