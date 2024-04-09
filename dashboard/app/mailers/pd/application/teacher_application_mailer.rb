module Pd::Application
  class TeacherApplicationMailer < ApplicationMailer
    # This should be kept consistent with the signature in _partner_signature.html.haml
    CODE_ORG_DEFAULT_NOTIFICATION_EMAIL = email_address_with_name('teacher@code.org', 'Nikki Navta')
    default from: email_address_with_name('noreply@code.org', 'Code.org')
    default bcc: MailerConstants::PLC_EMAIL_LOG

    def confirmation(teacher_application)
      @application = teacher_application

      if @application.regional_partner
        mail(
          to: @application.formatted_applicant_email,
          reply_to: @application.formatted_partner_contact_email,
          subject: "#{@application.regional_partner.name} has received your application for Code.org's Professional Learning Program",
        )
      else
        mail(
          from: CODE_ORG_DEFAULT_NOTIFICATION_EMAIL,
          to: @application.formatted_applicant_email,
          subject: "We've received your application for Code.org's Professional Learning Program!"
        )
      end
    end

    def admin_approval_teacher_reminder(teacher_application)
      @application = teacher_application

      if @application.regional_partner
        mail(
          to: @application.formatted_applicant_email,
          reply_to: @application.formatted_partner_contact_email,
          subject: "REMINDER - Action Needed: Your application needs Administrator/School Leader approval"
        )
      else
        mail(
          from: CODE_ORG_DEFAULT_NOTIFICATION_EMAIL,
          to: @application.formatted_applicant_email,
          subject: "REMINDER - Action Needed: Your application needs Administrator/School Leader approval"
        )
      end
    end

    def needs_admin_approval(teacher_application)
      @application = teacher_application

      if @application.regional_partner
        mail(
          to: @application.formatted_applicant_email,
          reply_to: @application.formatted_partner_contact_email,
          subject: "Important: Your Application Requires Administrator/School Leader Approval"
        )
      else
        mail(
          from: CODE_ORG_DEFAULT_NOTIFICATION_EMAIL,
          to: @application.formatted_applicant_email,
          subject: "Important: Your Application Requires Administrator/School Leader Approval"
        )
      end
    end

    def admin_approval(teacher_application)
      @application = teacher_application

      mail(
        to: @application.formatted_principal_email,
        reply_to: @application.formatted_partner_contact_email,
        subject: "Action Needed: #{@application.applicant_full_name} has applied to " \
            "#{@application.effective_regional_partner_name}'s Professional Learning Program!"
      )
    end

    def admin_approval_completed(teacher_application)
      @application = teacher_application

      mail(
        to: @application.formatted_principal_email,
        reply_to: @application.formatted_partner_contact_email,
        subject: "Thank you for completing your teacher's application"
      )
    end

    def admin_approval_completed_partner(teacher_application)
      @application = teacher_application

      mail(
        from: CODE_ORG_DEFAULT_NOTIFICATION_EMAIL,
        to: @application.formatted_partner_contact_email || CODE_ORG_DEFAULT_NOTIFICATION_EMAIL,
        subject: "#{@application.applicant_full_name} has received Administrator/School Leader approval!"
      )
    end

    def admin_approval_completed_teacher_receipt(teacher_application)
      @application = teacher_application

      if @application.regional_partner
        mail(
          to: @application.formatted_applicant_email,
          reply_to: @application.formatted_partner_contact_email,
          subject: "Your Administrator/School Leader has approved your application!"
        )
      else
        mail(
          from: CODE_ORG_DEFAULT_NOTIFICATION_EMAIL,
          to: @application.formatted_applicant_email,
          subject: "Your Administrator/School Leader has approved your application!"
        )
      end
    end

    def accepted(teacher_application)
      @application = teacher_application
      congrats_from = @application.regional_partner ? "#{@application.effective_regional_partner_name} and " : ""

      mail(
        to: @application.formatted_applicant_email,
        reply_to: @application.formatted_partner_contact_email,
        subject: "Congratulations from #{congrats_from}Code.org!"
      )
    end

    # Reminder email sent to teachers who have not enrolled in a workshop within
    # two weeks of being accepted into the program.
    def registration_reminder(teacher_application)
      @application = teacher_application

      mail(
        to: @application.formatted_applicant_email,
        reply_to: @application.formatted_partner_contact_email,
        subject: "Register for the #{@application.effective_regional_partner_name} #{@application.course_name} Summer Workshop"
      )
    end

    def complete_application_initial_reminder(teacher_application)
      @application = teacher_application

      mail(
        to: @application.formatted_applicant_email,
        subject: "Reminder: Complete your application for Code.org's Professional Learning Program"
      )
    end

    def complete_application_final_reminder(teacher_application)
      @application = teacher_application

      mail(
        to: @application.formatted_applicant_email,
        subject: "Follow Up: Complete your application for Code.org's Professional Learning Program"
      )
    end

    def declined(teacher_application)
      @application = teacher_application

      mail(
        to: @application.formatted_applicant_email,
        reply_to: @application.formatted_partner_contact_email,
        subject: "Your Professional Learning Program application status"
      )
    end

    # Remove empty params. This can happen when the regional partner contact info is missing
    protected def mail(params)
      super params.compact
    end
  end
end
