# == Schema Information
#
# Table name: email_preferences
#
#  id         :integer          not null, primary key
#  email      :string(255)      not null
#  opt_in     :boolean          not null
#  ip_address :string(255)      not null
#  source     :string(255)      not null
#  form_kind  :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_email_preferences_on_email  (email) UNIQUE
#

class EmailPreference < ApplicationRecord
  validates_presence_of :email, :ip_address, :source
  validates_inclusion_of :opt_in, {in: [true, false]}
  validates_uniqueness_of :email
  validates_email_format_of :email

  SOURCE_TYPES = [
    ACCOUNT_SIGN_UP = 'Teacher account sign up',
    ACCOUNT_TYPE_CHANGE = 'Student account change to teacher',
    ACCOUNT_EMAIL_ADD = 'Add email to teacher account',
    ACCOUNT_EMAIL_CHANGE = 'Update teacher account email',
    FORM_HOUR_OF_CODE = 'Host Hour of Code form',
    FORM_VOLUNTEER = 'Volunteer form',
    FORM_REGIONAL_PARTNER = 'Regional partner contact',
  ].freeze

  validates_inclusion_of :source, in: SOURCE_TYPES

  def email=(value)
    super(value&.strip&.downcase)
  end

  def self.upsert!(email:, opt_in:, ip_address:, source:, form_kind:)
    email_preference = EmailPreference.find_or_initialize_by(email: email)
    email_preference.update!(
      email: email,
      # Don't change opt_in to false if the record exists already.  We currently only allow user to opt out via Pardot
      # unsubscribe link.
      opt_in: (!email_preference.new_record? && !opt_in) ? email_preference.opt_in : opt_in,
      ip_address: ip_address,
      source: source,
      form_kind: form_kind
    )
  end
end
