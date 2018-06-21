class Pd::InternationalOptinController < ApplicationController
  load_resource :international_optin, class: 'Pd::InternationalOptin', id_param: :contact_id, only: [:thanks]

  # GET /pd/international_optins/new
  def new
    @script_data = {
      props: {
        options: Pd::InternationalOptin.options.camelize_keys,
        apiEndpoint: "/api/v1/pd/international_optins"
      }.to_json
    }
  end

  # Get /pd/international_optins/:contact_id/thanks
  def thanks
    @regional_partner = @international_optin.try(:regional_partner)
  end
end
