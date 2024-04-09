require 'mailjet'
require 'honeybadger/ruby'
require_relative './shared_constants/mailjet_constants'

module MailJet
  include MailJetConstants

  API_KEY = CDO.try(:mailjet_api_key).freeze
  SECRET_KEY = CDO.try(:mailjet_secret_key).freeze

  # We use MailJet when the following are true:
  # - The use_mailjet DCDO is true
  # - We are not in the test environment
  # - We have the required secrets set
  def self.enabled?
    DCDO.get('use_mailjet', false) &&
      !Rails.env.test? &&
      API_KEY.present? &&
      SECRET_KEY.present?
  end

  def self.subaccount
    case Rails.env
    when 'production'
      'production'
    when 'staging'
      'staging'
    else
      'development'
    end
  end

  def self.create_contact_and_send_welcome_email(user)
    return unless enabled?

    return unless user&.id.present?
    return unless user.teacher?

    create_contact(user.email, user.name, user.created_at.to_datetime)
    send_template_email(
      user.email,
      user.name,
      EMAILS[:welcome]
    )
  end

  def self.create_contact(email, name, sign_up_date)
    return unless enabled?

    Mailjet.configure do |config|
      config.api_key = API_KEY
      config.secret_key = SECRET_KEY
      config.api_version = "v3"
    end

    contact = Mailjet::Contactdata.find(email)

    if contact&.id.nil?
      Mailjet::Contact.create(
        is_excluded_from_campaigns: true,
        email: email,
        name: name
      )
      contact = Mailjet::Contactdata.find(email)
    end

    sign_up_date_rfc3339 = sign_up_date.rfc3339
    contact.update_attributes(
      data: [
        {
          name: 'sign_up_date',
          value: sign_up_date_rfc3339
        }
      ]
    )
  end

  def self.send_template_email(to_email, to_name, email_config)
    return unless enabled?

    Mailjet.configure do |config|
      config.api_key = API_KEY
      config.secret_key = SECRET_KEY
      config.api_version = "v3.1"
    end

    from_address = email_config[:from_address]
    from_name = email_config[:from_name]
    template_id = email_config[:template_id][subaccount.to_sym]

    Mailjet::Send.create(messages:
      [{
        From: {
          Email: from_address,
          Name: from_name
        },
        To: [
          {
            Email: to_email,
            Name: to_name
          }
        ],
        TemplateID: template_id,
        TemplateLanguage: true,
      }]
    )
  end
end
