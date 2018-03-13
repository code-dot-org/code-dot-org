class Pd::RegionalPartnerContactMailer < ActionMailer::Base
  default from: 'Tanya Parker <tanya_parker@code.org>'

  def matched(form, pm)
    @form = form
    role = form[:role].downcase

    pm_id = pm.program_manager_id
    user = User.find(pm_id)
    @name = user.name

    mail(
      to: user.email,
      subject: "A " + role + " would like to connect with you"
    )
  end

  def unmatched(form)
    @form = form
    role = form[:role].downcase

    mail(
      to: 'Partners <partner@code.org>',
      subject: "A " + role + " wants to connect with Code.org"
    )
  end

  def receipt(form)
    @form = form

    interest = "professional learning program"
    unless form[:role] == "Teacher"
      interest = "administrator support"
    end
    @interest = interest

    mail(
      to: form[:email],
      subject: "Thank you for contacting us"
    )
  end
end
