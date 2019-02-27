class Api::V1::Pd::RegionalPartnerMiniContactsController < Api::V1::Pd::FormsController
  skip_before_action :verify_authenticity_token

  def new_form
    @contact_form = ::Pd::RegionalPartnerMiniContact.new
  end

  def on_successful_create
    EmailPreference.upsert!(
      email: @contact_form.email,
      opt_in: false,
      ip_address: request.ip,
      source: EmailPreference::FORM_PD_REGIONAL_PARTNER_MINI_CONTACT,
      form_kind: "0"
    )
  end
end
