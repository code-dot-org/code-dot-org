require 'mailjet'
require 'honeybadger/ruby'
require_relative './shared_constants/mailjet_constants'

module MailJet
  include MailJetConstants

  API_KEY = CDO.try(:mailjet_api_key).freeze
  SECRET_KEY = CDO.try(:mailjet_secret_key).freeze

  def self.enabled?
    DCDO.get('use_mailjet', false) && API_KEY.present? && SECRET_KEY.present?
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

    create_contact(user.email, user.name, user.created_at.to_datetime.rfc3339)
    send_template_email(
      user.email,
      EMAILS[:welcome][:from_address],
      user.name,
      EMAILS[:welcome][:from_name],
      EMAILS[:welcome][:template_id][subaccount.to_sym]
    )
  end

  def self.create_contact(email, name, sign_up_date)
    return unless enabled?

    Mailjet.configure do |config|
      config.api_key = API_KEY
      config.secret_key = SECRET_KEY
      config.api_version = "v3"
    end

    # If a contact already exists, Mailjet will raise an error.
    # This shouldn't happen as user emails should be unique, but
    # we don't want to block sign up if it does.
    begin
      Mailjet::Contact.create(
        is_excluded_from_campaigns: true,
        email: email,
        name: name
      )
    rescue => exception
      Honeybadger.notify(exception)
    end

    # Most likely, the above would fail if a contact already exists.
    # In that case, we want to update the contact with the sign up date.
    # However, in the case of a different error, we want to notify Honeybadger,
    # but not block sign up.
    begin
      contact = Mailjet::Contactdata.find(email)
      contact.update_attributes(
        data: [
          {
            name: 'sign_up_date',
            value: sign_up_date
          }
        ]
      )
    rescue => exception
      Honeybadger.notify(exception)
    end
  end

  def self.send_template_email(to_email, from_email, to_name, from_name, template_id)
    return unless enabled?

    Mailjet.configure do |config|
      config.api_key = API_KEY
      config.secret_key = SECRET_KEY
      config.api_version = "v3.1"
    end

    Mailjet::Send.create(messages:
      [{
        From: {
          Email: from_email,
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
