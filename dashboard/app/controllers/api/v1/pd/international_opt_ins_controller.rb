class Api::V1::Pd::InternationalOptInsController < Api::V1::Pd::FormsController
  authorize_resource class: 'Pd::InternationalOptIn', only: :create

  def new_form
    @contact_form = ::Pd::InternationalOptIn.new(
      user: current_user
    )
  end

  def on_successful_create
    EmailPreference.upsert!(
      email: @contact_form.email,
      opt_in: @contact_form.email_opt_in?,
      ip_address: request.ip,
      source: EmailPreference::FORM_PD_INTERNATIONAL_OPT_IN,
      form_kind: "0"
    )

    verify_teacher
  end

  private def verify_teacher
    return if current_user.verified_teacher?

    current_user.update(permission: UserPermission::AUTHORIZED_TEACHER)
  end
end
