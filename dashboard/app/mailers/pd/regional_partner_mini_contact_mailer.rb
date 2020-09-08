class Pd::RegionalPartnerMiniContactMailer < ActionMailer::Base
  NO_REPLY = 'Code.org <noreply@code.org>'
  default from: 'Liz Gauthier <partner@code.org>'
  default bcc: MailerConstants::PLC_EMAIL_LOG

  def matched(form, rp_pm)
    @form = form

    pm = User.find(rp_pm.program_manager_id)
    @name = pm.name

    subject = "Question about Code.org program"

    mail(
      to: pm.email,
      subject: subject
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
