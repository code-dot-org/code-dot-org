module Pd::Application
  class Teacher1920ApplicationMailer < ActionMailer::Base
    default from: 'Code.org <noreply@code.org>'

    def confirmation(teacher_application)
      @application = teacher_application

      if @application.regional_partner
        mail(
          to: @application.formatted_teacher_email,
          reply_to: @application.formatted_partner_contact_email,
          subject: "We've received your application for #{@application.regional_partner.name}'s Professional Learning Program!"
        )
      else
        mail(
          from: 'Code.org <teacher@code.org>',
          to: @application.formatted_teacher_email,
          subject: "We've received your application for Code.org's Professional Learning Program!"
        )
      end
    end

    def principal_approval(teacher_application)
      @application = teacher_application

      mail(
        to: @application.formatted_principal_email,
        cc: @application.formatted_teacher_email,
        reply_to: @application.formatted_partner_contact_email,
        subject: "Action Needed: Your teacher has applied to #{@application.regional_partner.name}'s Professional Learning Program!"
      )
    end

    def principal_approval_completed(teacher_application)
      @application = teacher_application

      mail(
        to: @application.formatted_principal_email,
        cc: @application.formatted_teacher_email,
        reply_to: @application.formatted_partner_contact_email,
        subject: "Thank you for completing your teacher’s application"
      )
    end

    def principal_approval_completed_partner(teacher_application)
      @application = teacher_application

      mail(
        from: 'Anthonette Pena <teacher@code.org>',
        to: @application.formatted_partner_contact_email,
        subject: 'A principal has completed the principal approval form'
      )
    end

    def accepted_no_cost_registration(teacher_application)
      @application = teacher_application

      mail(
        to: @application.formatted_teacher_email,
        reply_to: @application.formatted_partner_contact_email,
        subject: "Congratulations from #{@application.regional_partner.name} and Code.org!"
      )
    end

    def registration_sent(teacher_application)
      @application = teacher_application

      mail(
        to: @application.formatted_teacher_email,
        reply_to: @application.formatted_partner_contact_email,
        subject: "Register for the #{@application.regional_partner.name} #{@application.course_name} Summer Workshop"
      )
    end

    def declined(teacher_application)
      @application = teacher_application

      mail(
        to: @application.formatted_teacher_email,
        reply_to: @application.formatted_partner_contact_email,
        subject: "Your Professional Learning Program application status"
      )
    end

    def waitlisted(teacher_application)
      @application = teacher_application

      mail(
        to: @application.formatted_teacher_email,
        reply_to: @application.formatted_partner_contact_email,
        subject: "Your Professional Learning Program application status"
      )
    end
  end
end
