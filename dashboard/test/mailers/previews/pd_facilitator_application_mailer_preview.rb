# This can be viewed on non-production environments at /rails/mailers/pd/teacher_application_mailer
class Pd::FacilitatorApplicationMailerPreview < ActionMailer::Preview
  include FactoryGirl::Syntax::Methods
  include Pd::Application::ActiveApplicationModels

  def confirmation
    FACILITATOR_APPLICATION_MAILER_CLASS.confirmation build_application
  end

  def confirmation_csf
    FACILITATOR_APPLICATION_MAILER_CLASS.confirmation build_application(course: 'csf')
  end

  def declined
    FACILITATOR_APPLICATION_MAILER_CLASS.declined build_application
  end

  def declined_csf
    FACILITATOR_APPLICATION_MAILER_CLASS.declined build_application(course: 'csf')
  end

  def waitlisted
    FACILITATOR_APPLICATION_MAILER_CLASS.waitlisted build_application
  end

  def waitlisted_csf
    FACILITATOR_APPLICATION_MAILER_CLASS.waitlisted build_application(course: 'csf')
  end

  private

  def build_application(course: 'csp')
    # Build user explicitly (instead of create) so it's not saved
    user = build :teacher, email: 'rubeus@hogwarts.co.uk'
    build FACILITATOR_APPLICATION_FACTORY, user: user, course: course
  end
end
