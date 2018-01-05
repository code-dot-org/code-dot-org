module Pd::Application
  class Teacher1819ApplicationMailer < ActionMailer::Base
    default from: 'Code.org <teacher@code.org>'

    def confirmation(teacher_application)
      @application = teacher_application

      mail(
        to: @application.user.email,
        subject: "We've received your application for Code.org's Professional Learning Program!"
      )
    end

    def accepted(teacher_application)
      @application = teacher_application

      mail(
        to: @application.user.email,
        subject: "You've been accepted to Code.org's Professional Learning Program!"
      )
    end

    def declined(teacher_application)
      @application = teacher_application

      mail(
        to: @application.user.email,
        subject: "Update on your Code.org Professional Learning Program application"
      )
    end

    def waitlisted(teacher_application)
      @application = teacher_application

      mail(
        to: @application.user.email,
        subject: "Status update for your Code.org Professional Learning Program application"
      )
    end

    def principal_approval(teacher_application)
      @application = teacher_application

      mail(
        to: @application.principal_email,
        cc: @application.user.email,
        subject: "Approval requested: #{@application.teacher_full_name}'s participation in Code.org's Professional Learning Program"
      )
    end

    def principal_approval_received(teacher_application)
      @application = teacher_application

      mail(
        to: @application.user.email,
        subject: "We've received your principal's approval form"
      )
    end
  end
end
