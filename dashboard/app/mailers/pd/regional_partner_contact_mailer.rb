class Pd::RegionalPartnerContactMailer < ActionMailer::Base
  default from: 'Tanya Parker <tanya_parker@code.org>'

  def matched(form, rp_pm)
    @form = form
    role = form[:role].downcase

    pm = User.find(rp_pm.program_manager_id)
    @name = pm.name

    mail(
      to: pm.email,
      subject: "A " + role + " would like to connect with you"
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

  def receipt(form)
    @form = form
    @interest = form[:role] == "Teacher" ? "professional learning program" : "administrator support"

    mail(
      to: form[:email],
      subject: "Thank you for contacting us"
    )
  end
end
