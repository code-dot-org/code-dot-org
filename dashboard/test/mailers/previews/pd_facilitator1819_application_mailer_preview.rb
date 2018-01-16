# This can be viewed on non-production environments at /rails/mailers/pd/teacher_application_mailer
class Pd::Facilitator1819ApplicationMailerPreview < ActionMailer::Preview
  include FactoryGirl::Syntax::Methods

  def confirmation
    Pd::Application::Facilitator1819ApplicationMailer.confirmation build_application
  end

  def confirmation_csf
    Pd::Application::Facilitator1819ApplicationMailer.confirmation build_application(course: 'csf')
  end

  def declined
    Pd::Application::Facilitator1819ApplicationMailer.declined build_application
  end

  def declined_csf
    Pd::Application::Facilitator1819ApplicationMailer.declined build_application(course: 'csf')
  end

  def waitlisted
    Pd::Application::Facilitator1819ApplicationMailer.waitlisted build_application
  end

  def waitlisted_csf
    Pd::Application::Facilitator1819ApplicationMailer.waitlisted build_application(course: 'csf')
  end

  private

  def build_application(course: 'csp')
    # Build user explicitly (instead of create) so it's not saved
    user = build :teacher, email: 'rubeus@hogwarts.co.uk'
    build :pd_facilitator1819_application, user: user, course: course
  end
end
