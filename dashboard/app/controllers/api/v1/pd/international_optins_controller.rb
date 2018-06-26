class Api::V1::Pd::InternationalOptinsController < Api::V1::Pd::FormsController
  def new_form
    @contact_form = ::Pd::InternationalOptin.new
  end

  def on_successful_create
    if current_user.email
      EmailPreference.upsert!(
        email: current_user.email,
        opt_in: @contact_form.opt_in?,
        ip_address: request.ip,
        source: EmailPreference::FORM_PD_INTERNATIONAL_OPTIN,
        form_kind: "0"
      )
    end
  end
end
