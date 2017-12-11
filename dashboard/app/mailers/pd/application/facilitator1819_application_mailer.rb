module Pd::Application
  class Facilitator1819ApplicationMailer < ActionMailer::Base
    default from: 'Code.org <facilitators@code.org>'

    def confirmation(facilitator_application)
      @application = facilitator_application
      @signed = facilitator_application.csf? ? 'Jenna Garcia' : 'Sarah Fairweather'

      mail(
        to: @application.user.email,
        subject: "We've received your facilitator application!"
      )
    end

    def declined(facilitator_application)
      @application = facilitator_application

      mail(
        to: @application.user.email,
        subject: "Your Code.org facilitator application status"
      )
    end

    def waitlisted(facilitator_application)
      @application = facilitator_application

      mail(
        to: @application.user.email,
        subject: "Your Code.org facilitator application status"
      )
    end
  end
end
