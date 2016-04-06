require 'mail'
require 'active_support/core_ext/object/blank'

# A module for checking email addresses for validity.
module EmailValidator

  # Returns true if address is a valid email address.
  def self.email_address?(address)
    return false if address.blank?  # Must not be blank
    email = Mail::Address.new(address)

    return false unless email.address == address  # Must be well-formed
    return false unless email.domain  # Must have a domain

    # Reject single part domains like "localhost".
    domain_parts = email.domain.split('.')
    return false if domain_parts.length < 2

    # Reject invalid domains like "example..com"
    return false if domain_parts.include?('')

    # Everything valid!
    true
  rescue Mail::Field::ParseError
    false
  end
end
