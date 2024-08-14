require 'mailjet'
require 'mailgun-ruby'
require 'honeybadger/ruby'
require_relative './shared_constants/mailjet_constants'

module MailJet
  include MailJetConstants

  API_KEY = CDO.try(:mailjet_api_key).freeze
  SECRET_KEY = CDO.try(:mailjet_secret_key).freeze
  MAILGUN_API_KEY = CDO.try(:mailgun_api_key).freeze

  # We use MailJet when the following are true:
  # - The use_mailjet DCDO is true
  # - We are not in the test environment
  # - We have the required secrets set
  def self.enabled?
    DCDO.get('use_mailjet', false) &&
      !Rails.env.test? &&
      API_KEY.present? &&
      SECRET_KEY.present? &&
      MAILGUN_API_KEY.present?
  end

  def self.subaccount
    case Rails.env
    when 'production'
      'production'
    when 'staging'
      'staging'
    when 'test'
      # We don't want to send real emails in test
      ''
    else
      'development'
    end
  end

  def self.create_contact_and_add_to_welcome_series(user, locale = 'en-US')
    return unless enabled?

    return unless user&.id.present?
    return unless user.teacher?

    contact = find_or_create_contact(user.email, user.name)
    update_contact_field(contact, 'sign_up_date', user.created_at.to_datetime.rfc3339)
    contact_list_id = CONTACT_LISTS[:welcome_series][locale.to_sym] || CONTACT_LISTS[:welcome_series][:default]
    add_to_contact_list(contact, contact_list_id)
  end

  def self.find_or_create_contact(email, name)
    return nil unless enabled?
    return nil unless valid_email?(email)

    configure_api_v3

    contact = Mailjet::Contact.find(email)
    return contact if contact&.id.present?

    Mailjet::Contact.create(
      is_excluded_from_campaigns: false,
      email: email,
      name: name
    )
    Mailjet::Contact.find(email)
  end

  def self.update_contact_field(contact, field_name, field_value)
    return unless enabled?
    return if contact.nil?

    contactdata = Mailjet::Contactdata.find(contact.id)
    contactdata.update_attributes(
      data: [
        {
          name: field_name,
          value: field_value
        }
      ]
    )
  end

  def self.delete_contact(email)
    return unless enabled?

    configure_api_v3

    contact = Mailjet::Contact.find(email)
    return unless contact

    delete_uri = URI.parse("https://api.mailjet.com/v4/contacts/#{contact.id}")
    delete_http_request = Net::HTTP::Delete.new(delete_uri)
    delete_http_request.basic_auth(API_KEY, SECRET_KEY)

    Net::HTTP.start(delete_uri.hostname, delete_uri.port, use_ssl: true) do |http|
      http.request(delete_http_request)
    end
  end

  def self.add_to_contact_list(contact, list_id)
    return unless enabled?
    return if contact.nil?

    configure_api_v3

    # This will raise an exception if the contact is already on the list
    Mailjet::Listrecipient.create(
      list_id: list_id,
      contact_id: contact.id
    )
  end

  def self.send_template_email(contact, email_config, locale = 'en-US')
    return unless enabled?
    return unless contact&.email.present?

    configure_api_v3dot1

    from_address = email_config[:from_address]
    from_name = email_config[:from_name]
    template_config = email_config[:template_id][subaccount.to_sym]
    template_id = template_config[locale.to_sym] || template_config[:default]

    Mailjet::Send.create(messages:
      [{
        From: {
          Email: from_address,
          Name: from_name
        },
        To: [
          {
            Email: contact.email,
            Name: contact.name
          }
        ],
        TemplateID: template_id,
        TemplateLanguage: true,
      }]
    )
  end

  def self.valid_email?(email)
    return false unless enabled?

    Mailgun.api_key = MAILGUN_API_KEY
    email_validator = Mailgun::Address.new

    validation_response = email_validator.validate(email)
    # Description of values in the result field described here: https://documentation.mailgun.com/docs/inboxready/mailgun-validate/single-valid-ir/#result-types
    return false if %w(do_not_send undeliverable).include?(validation_response['result'])
    return true
  end

  # The send API has an option of v3 or v3.1. We've been using v3.1.
  def self.configure_api_v3dot1
    Mailjet.configure do |config|
      config.api_key = API_KEY
      config.secret_key = SECRET_KEY
      config.api_version = "v3.1"
    end
  end

  def self.configure_api_v3
    Mailjet.configure do |config|
      config.api_key = API_KEY
      config.secret_key = SECRET_KEY
      config.api_version = "v3"
    end
  end
end
