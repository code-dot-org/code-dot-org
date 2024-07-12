class CpaU13SectionMailer < ApplicationMailer
  default from: 'Code.org <noreply@code.org>'

  def cpa_u13_section_warning(user, sections)
    @sections = sections
    mail(
      to: user.email,
      subject: "Warning - Some of your students require parental consent to continue using Code.org accounts"
    )
  end
end
