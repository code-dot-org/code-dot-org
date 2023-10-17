# This can be viewed on non-production environments at /rails/mailers/pd_teacher_application_mailer
class PdTeacherApplicationMailerPreview < ActionMailer::Preview
  include FactoryBot::Syntax::Methods
  include Pd::Application::ActiveApplicationModels

  %w(
    confirmation
    admin_approval_teacher_reminder
    admin_approval
    admin_approval_completed
    admin_approval_completed_partner
    admin_approval_completed_teacher_receipt
    needs_admin_approval
    accepted
    complete_application_initial_reminder
    complete_application_final_reminder
    registration_reminder
    declined
  ).each do |mail_type|
    define_method "#{mail_type}__with_partner".to_sym do
      Pd::Application::TeacherApplicationMailer.send mail_type, build_application(matched: true, is_awaiting_admin_approval: false)
    end
    define_method "#{mail_type}__without_partner".to_sym do
      Pd::Application::TeacherApplicationMailer.send mail_type, build_application(matched: false, is_awaiting_admin_approval: false)
    end
  end

  # We also use the confirmation email for awaiting admin approval
  def confirmation_awaiting_admin_approval__with_partner
    Pd::Application::TeacherApplicationMailer.send :confirmation, build_application(matched: true, is_awaiting_admin_approval: true)
  end

  def confirmation_awaiting_admin_approval__without_partner
    Pd::Application::TeacherApplicationMailer.send :confirmation, build_application(matched: false, is_awaiting_admin_approval: true)
  end

  private

  def build_application(matched: true, is_awaiting_admin_approval: true, partner_contact_info: true)
    # Build user explicitly (instead of create) so it's not saved
    school_info = build :school_info, school: School.first
    user = build :teacher, email: 'rubeus@hogwarts.co.uk', school_info: school_info
    application_hash = build TEACHER_APPLICATION_HASH_FACTORY, school: School.first
    status = is_awaiting_admin_approval ? 'awaiting_admin_approval' : 'unreviewed'
    application = build TEACHER_APPLICATION_FACTORY, user: user, course: 'csp', form_data: application_hash.to_json, status: status

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
