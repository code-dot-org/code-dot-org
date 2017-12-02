module Pd::Application
  class Teacher1819ApplicationMailer < ActionMailer::Base
    default from: 'Code.org <facilitators@code.org>'

    def confirmation(teacher_application)
      @application = teacher_application

      mail(
        to: @application.user.email,
        subject: "We've received your application for Code.org's Professional Learning Program!"
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
