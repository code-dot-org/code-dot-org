class Pd::RegionalPartnerMiniContactController < ApplicationController
  # GET /pd/regional_partner_mini_contacts/new
  def new
    view_options(full_width: true, responsive_content: true)

    options = Pd::RegionalPartnerMiniContact.options.camelize_keys
    options.merge!(
      {
        user_name: current_user&.name,
        email: current_user&.email,
        zip: current_user&.school_info&.school&.zip || current_user&.school_info&.zip,
        notes: "I'm interested in Professional Learning!"
      }
    )

    @unit_data = {
      props: {
        options: options,
        apiEndpoint: "/api/v1/pd/regional_partner_mini_contacts"
      }.to_json
    }
  end
end
