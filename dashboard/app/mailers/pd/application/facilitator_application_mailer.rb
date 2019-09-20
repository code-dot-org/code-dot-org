module Pd::Application
  class FacilitatorApplicationMailer < ActionMailer::Base
    default from: 'Code.org <facilitators@code.org>'
    default bcc: MailerConstants::PLC_EMAIL_LOG
    helper_method :signed_by, :from

    def confirmation(facilitator_application)
      @application = facilitator_application

      mail(
        to: @application.formatted_applicant_email,
        from: from(@application),
        subject: "We've received your facilitator application!"
      )
    end

    def declined(facilitator_application)
      @application = facilitator_application

      mail(
        to: @application.formatted_applicant_email,
        from: from(@application),
        cc: @application.formatted_partner_contact_email,
        subject: "Your Code.org facilitator application status"
      )
    end

    def waitlisted(facilitator_application)
      @application = facilitator_application

      mail(
        to: @application.formatted_applicant_email,
        from: from(@application),
        cc: @application.formatted_partner_contact_email,
        subject: "Your Code.org facilitator application status"
      )
    end

    private

    def from(facilitator_application)
      "#{signed_by(facilitator_application)} <facilitators@code.org>"
    end

    def signed_by(facilitator_application)
      facilitator_application.csf? ? 'Megan Hochstatter' : 'Sarah Fairweather'
    end
  end
end
