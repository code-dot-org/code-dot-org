require 'mailjet'

module MailJet
  API_KEY = CDO.mailjet_api_key.freeze
  SECRET_KEY = CDO.mailjet_secret_key.freeze

  def self.create_contact(email, name)
    Mailjet.configure do |config|
      config.api_key = API_KEY
      config.secret_key = SECRET_KEY
    end

    variable = Mailjet::Contact.create(
      is_excluded_from_campaigns: "true",
      email: email,
      name: name
    )
    p variable.attributes['Data']
  end

  def self.send_template_email(to_email, template_id)
    Mailjet.configure do |config|
      config.api_key = API_KEY
      config.secret_key = SECRET_KEY
      config.api_version = "v3.1"
    end

    variable = Mailjet::Send.create(messages:
      [{
        From: {
          Email: 'bethany@code.org',
          Name: 'Me'
        },
        To: [
          {
            Email: to_email,
            Name: 'You'
          }
        ],
        TemplateID: template_id,
        TemplateLanguage: true,
        Subject: 'My first Mailjet Email!',
      }]
    )
    p variable.attributes['Messages']
  end
end
