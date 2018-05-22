class Api::V1::Pd::RegionalPartnerContactsController < Api::V1::Pd::FormsController
  def new_form
    @contact_form = ::Pd::RegionalPartnerContact.new
  end

  def on_successful_create
    EmailPreference.upsert!(
      email: @contact_form.email,
      opt_in: @contact_form.opt_in?,
      ip_address: request.ip,
      source: EmailPreference::FORM_REGIONAL_PARTNER,
      form_kind: "0"
    )
  end
end
