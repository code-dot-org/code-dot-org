module Pd::Application
  class Facilitator1920ApplicationMailer < ActionMailer::Base
    default from: 'Code.org <facilitators@code.org>'
    helper_method :signed_by, :from

    def confirmation(facilitator_application)
      @application = facilitator_application

      mail(
        to: @application.user.email,
        from: from(@application),
        subject: "We've received your facilitator application!"
      )
    end

    def declined(facilitator_application)
      @application = facilitator_application

      mail_data = {
        to: @application.user.email,
        from: from(@application),
        subject: "Your Code.org facilitator application status"
      }

      if @application.regional_partner
        mail_data = mail_data.merge({cc: @application.formatted_partner_contact_email})
      end

      mail(mail_data)
    end

    def waitlisted(facilitator_application)
      @application = facilitator_application

      mail_data = {
        to: @application.user.email,
        from: from(@application),
        subject: "Your Code.org facilitator application status"
      }

      if @application.regional_partner
        mail_data = mail_data.merge({cc: @application.formatted_partner_contact_email})
      end

      mail(mail_data)
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
