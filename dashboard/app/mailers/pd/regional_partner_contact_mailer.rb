class Pd::RegionalPartnerContactMailer < ActionMailer::Base
  NO_REPLY = 'Code.org <noreply@code.org>'
  default from: 'Anthonette Peña <partner@code.org>'

  def matched(form, rp_pm)
    @form = form

    pm = User.find(rp_pm.program_manager_id)
    @name = pm.name

    mail(
      to: pm.email,
      subject: "A teacher and/or administrator would like to connect with you"
    )
  end

  # TODO: When cc supported, unmatched email cc's Jenna
  def unmatched(form, email, matched_but_no_pms = false)
    @form = form
    @matched_but_no_pms = matched_but_no_pms
    role = form[:role].downcase

    mail(
      to: email,
      subject: "A " + role + " wants to connect with Code.org"
    )
  end

  # @param [Hash] form
  # @param [RegionalPartner] regional_partner (can be nil if unmatched)
  def receipt(form, regional_partner)
    @form = form
    @regional_partner = regional_partner
    mail(
      from: NO_REPLY,
      to: form[:email],
      subject: "Thank you for contacting your Code.org Regional Partner",
    )
  end
end
