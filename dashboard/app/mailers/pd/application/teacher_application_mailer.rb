module Pd::Application
  class TeacherApplicationMailer < ActionMailer::Base
    CODE_ORG_DEFAULT_NOTIFICATION_EMAIL = 'Jared Fritz <jared@code.org>'
    default from: 'Code.org <noreply@code.org>'
    default bcc: MailerConstants::PLC_EMAIL_LOG

    def confirmation(teacher_application)
      @application = teacher_application

      if @application.regional_partner
        mail(
          to: @application.formatted_applicant_email,
          reply_to: @application.formatted_partner_contact_email,
          subject: "We've received your application for #{@application.regional_partner.name}'s Professional Learning Program!"
        )
      else
        mail(
          from: 'Code.org <teacher@code.org>',
          to: @application.formatted_applicant_email,
          subject: "We've received your application for Code.org's Professional Learning Program!"
        )
      end
    end

    def principal_approval_teacher_reminder(teacher_application)
      @application = teacher_application

      if @application.regional_partner
        mail(
          to: @application.formatted_applicant_email,
          reply_to: @application.formatted_partner_contact_email,
          subject: "REMINDER: Action Needed: Your principal has not yet submitted your approval form"
        )
      else
        mail(
          from: 'Code.org <teacher@code.org>',
          to: @application.formatted_applicant_email,
          subject: "REMINDER: Action Needed: Your principal has not yet submitted your approval form"
        )
      end
    end

    def principal_approval(teacher_application)
      @application = teacher_application

      mail(
        to: @application.formatted_principal_email,
        cc: @application.formatted_applicant_email,
        reply_to: @application.formatted_partner_contact_email,
        subject: "Action Needed: Your teacher has applied to" \
            " #{@application.effective_regional_partner_name}'s Professional Learning Program!"
      )
    end

    def principal_approval_completed(teacher_application)
      @application = teacher_application

      mail(
        to: @application.formatted_principal_email,
        cc: @application.formatted_applicant_email,
        reply_to: @application.formatted_partner_contact_email,
        subject: "Thank you for completing your teacher's application"
      )
    end

    def principal_approval_completed_partner(teacher_application)
      @application = teacher_application

      mail(
        from: 'Jared Fritz <teacher@code.org>',
        to: @application.formatted_partner_contact_email || CODE_ORG_DEFAULT_NOTIFICATION_EMAIL,
        subject: 'A principal has completed the principal approval form'
      )
    end

    def accepted_no_cost_registration(teacher_application)
      @application = teacher_application

      mail(
        to: @application.formatted_applicant_email,
        reply_to: @application.formatted_partner_contact_email,
        subject: "Congratulations from #{@application.effective_regional_partner_name} and Code.org!"
      )
    end

    def registration_sent(teacher_application)
      @application = teacher_application

      mail(
        to: @application.formatted_applicant_email,
        reply_to: @application.formatted_partner_contact_email,
        subject: "Register for the #{@application.effective_regional_partner_name} #{@application.course_name} Summer Workshop"
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

    def declined(teacher_application)
      @application = teacher_application

      mail(
        to: @application.formatted_applicant_email,
        reply_to: @application.formatted_partner_contact_email,
        subject: "Your Professional Learning Program application status"
      )
    end

    def waitlisted(teacher_application)
      @application = teacher_application

      mail(
        to: @application.formatted_applicant_email,
        reply_to: @application.formatted_partner_contact_email,
        subject: "Your Professional Learning Program application status"
      )
    end

    protected

    # Remove empty params. This can happen when the regional partner contact info is missing
    def mail(params)
      super params.compact
    end
  end
end
