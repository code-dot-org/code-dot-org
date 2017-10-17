module Pd::Application
  class FacilitatorApplicationController < ApplicationController
    load_and_authorize_resource :facilitator_application, class: 'Pd::Application::FacilitatorApplication1819'

    def new
      return render :submitted if FacilitatorApplication1819.exists?(user: current_user)

      @script_data = {
        props: {
          options: FacilitatorApplication1819.options.camelize_keys,
          requiredFields: FacilitatorApplication1819.camelize_required_fields,
          accountEmail: current_user.email,
          apiEndpoint: '/api/v1/pd/application/facilitator'
        }.to_json
      }
    end
  end
end
