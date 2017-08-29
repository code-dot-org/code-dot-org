class Pd::RegionalPartnerContactController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin

  # GET /pd/regional_partner_contacts/new
  def new
    @script_data = {
      props: {
        options: Pd::RegionalPartnerContact.options.camelize_keys,
        apiEndpoint: "/api/v1/pd/regional_partner_contacts"
      }.to_json
    }
  end
end
