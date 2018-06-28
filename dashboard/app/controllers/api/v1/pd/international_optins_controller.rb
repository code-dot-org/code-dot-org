class Api::V1::Pd::InternationalOptinsController < Api::V1::Pd::FormsController
  authorize_resource class: 'Pd::InternationalOptin', only: :create

  def new_form
    @contact_form = ::Pd::InternationalOptin.new(
      user: current_user
    )
  end

  def on_successful_create
    EmailPreference.upsert!(
      email: @contact_form.email,
      opt_in: @contact_form.opt_in?,
      ip_address: request.ip,
      source: EmailPreference::FORM_PD_INTERNATIONAL_OPTIN,
      form_kind: "0"
    )
  end
end
