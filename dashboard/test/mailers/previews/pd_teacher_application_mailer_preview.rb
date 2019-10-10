# This can be viewed on non-production environments at /rails/mailers/pd/teacher_application_mailer
class Pd::TeacherApplicationMailerPreview < ActionMailer::Preview
  include FactoryGirl::Syntax::Methods

  %w(
    confirmation
    principal_approval_teacher_reminder
    principal_approval
    principal_approval_completed
    principal_approval_completed_partner
    accepted_no_cost_registration
    registration_sent
    declined
    waitlisted
  ).each do |mail_type|
    define_method "#{mail_type}__with_partner".to_sym do
      Pd::Application::TeacherApplicationMailer.send mail_type, build_application(matched: true)
    end
    define_method "#{mail_type}__with_partner_no_contact".to_sym do
      Pd::Application::TeacherApplicationMailer.send mail_type, build_application(matched: true, partner_contact_info: false)
    end
    define_method "#{mail_type}__without_partner".to_sym do
      Pd::Application::TeacherApplicationMailer.send mail_type, build_application(matched: false)
    end
  end

  private

  def build_application(matched: true, partner_contact_info: true)
    # Build user explicitly (instead of create) so it's not saved
    school_info = build :school_info, school: School.first
    user = build :teacher, email: 'rubeus@hogwarts.co.uk', school_info: school_info
    application_hash = build :pd_teacher1920_application_hash, school: School.first
    application = build :pd_teacher1920_application, user: user, course: 'csp', form_data: application_hash.to_json

    if matched
      regional_partner = build :regional_partner, name: 'We Teach Code'
      if partner_contact_info
        regional_partner.assign_attributes contact_name: 'Patty Partner', contact_email: 'patty@we_teach_code.ex.net'
      end
      application.regional_partner = regional_partner
    end
    application.pd_workshop_id = Pd::Workshop.first.try(:id) || (create :workshop).id
    application.generate_application_guid
    application
  end
end
