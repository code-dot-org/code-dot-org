require 'cdo/email_validator'
require 'active_support/core_ext/object'
require 'active_support/dependencies'
require_dependency 'cdo/shared_constants/email_preference_constants'

class EmailPreferenceHelper
  include EmailPreferenceConstants

  def self.upsert!(email:, opt_in:, ip_address:, source:, form_kind:)
    email = email&.strip&.downcase

    raise "Email is required" if email.blank?
    raise "IP Address is required" if ip_address.blank?
    raise "Source is required" if source.blank?
    # false.blank? returns true so check that opt_in is either true or false to enforce presence.
    raise "Opt In is required" unless [true, false].include?(opt_in)

    raise "Source is not included in the list" unless EmailPreferenceHelper::SOURCE_TYPES.include?(source)
    raise "Email does not appear to be a valid e-mail address" unless Cdo::EmailValidator.email_address?(email)

    current_time = Time.now

    # Assign the argument opt_in to a variable with a different name to avoid confusion below
    # between the value of the opt_in column in the existing row and the new/input value.
    input_opt_in = opt_in

    existing_email_preference = Dashboard.db[:email_preferences].where(email: email).first
    if !existing_email_preference
      Dashboard.db[:email_preferences].insert(
        {
          email: email,
          opt_in: input_opt_in,
          source: source,
          ip_address: ip_address,
          form_kind: form_kind,
          created_at: current_time,
          updated_at: current_time
        }
      )
    # Don't change opt_in to false if a preference with opt_in = true exists already.
    # We currently only enable a user to opt out via the Pardot unsubscribe link.
    elsif !existing_email_preference[:opt_in] || input_opt_in
      Dashboard.db[:email_preferences].where(email: email).update(
        {
          opt_in: input_opt_in,
          source: source,
          ip_address: ip_address,
          form_kind: form_kind,
          # Don't set created_at on an update.
          updated_at: current_time
        }
      )
    end
    # This is a write-only helper method.  Don't return data to the caller.
    return
  end
end
