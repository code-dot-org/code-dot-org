class Pd::RegionalPartnerContactController < ApplicationController
  load_resource :regional_partner_contact, class: 'Pd::RegionalPartnerContact', id_param: :contact_id, only: [:thanks]

  # GET /pd/regional_partner_contacts/new
  def new
    @script_data = {
      props: {
        options: Pd::RegionalPartnerContact.options.camelize_keys,
        apiEndpoint: "/api/v1/pd/regional_partner_contacts"
      }.to_json
    }
  end

  # Get /pd/regional_partner_contacts/:contact_id/thanks
  def thanks
    @regional_partner = @regional_partner_contact.try(:regional_partner)
  end
end
