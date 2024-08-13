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

  def self.create_contact_and_send_welcome_email(user, locale = 'en-US')
    return unless enabled?

    return unless user&.id.present?
    return unless user.teacher?

    contact = find_or_create_contact(user.email, user.name)
    update_contact_field(contact, 'sign_up_date', user.created_at.to_datetime.rfc3339)
    send_template_email(
      contact,
      EMAILS[:welcome],
      locale
    )
  end

  # This method sends a "CAP section warning" email to a specified user if certain conditions are met.
  #
  # Parameters:
  # user     - a single User object.
  # sections - an Array of sections, each with a 'Name' and a 'Link'.
  #            Example format:
  #             [
  #               { Name: 'Section 1', Link: 'https://example.com/section1' },
  #               { Name: 'Section 2', Link: 'https://example.com/section2' }
  #             ]
  # locale   - (optional) the locale for the email template. Defaults to 'en-US'.
  #
  # Returns:
  #   Nothing if the function exits early due to any of the following conditions:
  #     - the feature is not enabled.
  #     - the user is nil or does not have a valid ID.
  #     - the user is not a teacher.
  #
  # Workflow:
  #   1. Checks if the feature is enabled.
  #   2. Verifies the presence of a valid user ID.
  #   3. Ensures the user has a teacher role.
  #   4. Finds or creates a contact using the user's email and name.
  #   5. Sends a template email with the specified sections in the specified locale.
  def self.send_cap_section_warning_email(user, sections = [], locale = 'en-US')
    return unless enabled?

    return unless user&.id.present?
    return unless user.teacher?

    contact = find_or_create_contact(user.email, user.name)
    send_template_email(
      contact,
      EMAILS[:cap_section_warning],
      locale,
      {capSections: sections}
    )
  end

  def self.find_or_create_contact(email, name)
    return nil unless enabled?
    return nil unless valid_email?(email)

    Mailjet.configure do |config|
      config.api_key = API_KEY
      config.secret_key = SECRET_KEY
      config.api_version = "v3"
    end

    contact = Mailjet::Contact.find(email)
    return contact if contact&.id.present?

    Mailjet::Contact.create(
      is_excluded_from_campaigns: true,
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

    Mailjet.configure do |config|
      config.api_key = API_KEY
      config.secret_key = SECRET_KEY
      config.api_version = "v3"
    end

    contact = Mailjet::Contact.find(email)
    return unless contact

    delete_uri = URI.parse("https://api.mailjet.com/v4/contacts/#{contact.id}")
    delete_http_request = Net::HTTP::Delete.new(delete_uri)
    delete_http_request.basic_auth(API_KEY, SECRET_KEY)

    Net::HTTP.start(delete_uri.hostname, delete_uri.port, use_ssl: true) do |http|
      http.request(delete_http_request)
    end
  end

  def self.send_template_email(contact, email_config, locale = 'en-US', variables = {})
    return unless enabled?
    return unless contact&.email.present?

    Mailjet.configure do |config|
      config.api_key = API_KEY
      config.secret_key = SECRET_KEY
      config.api_version = "v3.1"
    end

    template_config = email_config[:template_id][subaccount.to_sym]
    # Each email template may have different required "messages:"" fields
    # See https://dev.mailjet.com/email/guides for more information regarding "messages:" format
    message = {}
    message[:From] = {Email: email_config[:from_address], Name: email_config[:from_name]}
    message[:To] = [{Email: contact.email, Name: contact.name}]
    message[:TemplateID] = template_config[locale.to_sym] || template_config[:default]
    message[:TemplateLanguage] = true
    message[:Variables] = variables if variables.present?

    Mailjet::Send.create(messages: [message])
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
end
