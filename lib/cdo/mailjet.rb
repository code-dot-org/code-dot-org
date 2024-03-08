require 'mailjet'

module MailJet
  API_KEY = CDO.mailjet_api_key.freeze
  SECRET_KEY = CDO.mailjet_secret_key.freeze

  def self.enabled?
    return false unless DCDO.get('use_mailjet', false)
    !API_KEY.nil? && !SECRET_KEY.nil?
  end

  WELCOME_TEMPLATE_ID = 5_421_128
  def self.create_contact_and_send_welcome_email(user)
    return unless enabled?

    return if user&.id.nil?
    return unless user.teacher?

    create_contact(user.email, user.name, user.created_at.to_datetime.rfc3339)
    send_template_email(user.email, WELCOME_TEMPLATE_ID)
  end

  def self.create_contact(email, name, sign_up_date)
    return unless enabled?

    Mailjet.configure do |config|
      config.api_key = API_KEY
      config.secret_key = SECRET_KEY
      config.api_version = "v3"
    end

    Mailjet::Contact.create(
      is_excluded_from_campaigns: "true",
      email: email,
      name: name
    )

    contact = Mailjet::Contactdata.find(email)
    contact.update_attributes(
      data: [
        {
          name: 'sign_up_date',
          value: sign_up_date
        }
      ]
    )
  end

  def self.send_template_email(to_email, template_id)
    return unless enabled?

    Mailjet.configure do |config|
      config.api_key = API_KEY
      config.secret_key = SECRET_KEY
      config.api_version = "v3.1"
    end

    Mailjet::Send.create(messages:
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
  end
end
