# This can be viewed on non-production environments at /rails/mailers/pd/teacher_application_mailer
class Pd::Teacher1920ApplicationMailerPreview < ActionMailer::Preview
  include FactoryGirl::Syntax::Methods

  def confirmation__with_partner
    Pd::Application::Teacher1920ApplicationMailer.confirmation build_application
  end

  def confirmation__without_partner
    Pd::Application::Teacher1920ApplicationMailer.confirmation build_application(matched: false)
  end

  %w(
    principal_approval
    principal_approval_completed
    principal_approval_completed_partner
    accepted_no_cost_registration
    registration_sent
    declined
    waitlisted
  ).each do |mail_type|
    define_method mail_type.to_sym do
      Pd::Application::Teacher1920ApplicationMailer.send mail_type, build_application
    end
  end

  private

  def build_application(matched: true)
    # Build user explicitly (instead of create) so it's not saved
    school_info = build :school_info, school: School.first
    user = build :teacher, email: 'rubeus@hogwarts.co.uk', school_info: school_info
    application_hash = build :pd_teacher1920_application_hash, school: School.first
    regional_partner = matched ? RegionalPartner.first : nil
    application = build :pd_teacher1920_application, user: user, course: 'csp', form_data: application_hash.to_json, regional_partner: regional_partner
    application.pd_workshop_id = Pd::Workshop.first.try(:id) || (create :pd_workshop).id
    application.generate_application_guid
    application
  end
end
