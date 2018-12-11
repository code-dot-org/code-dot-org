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

# Notes:
#   source: Indicates the source of the opt-in choice.
#   form_kind: "0", "1", etc.  Indicates which version of the opt-in string the
#     user agreed to, for a given source.  This value should be bumped each
#     time the corresponding user-facing string is updated.

class EmailPreference < ApplicationRecord
  include EmailPreferenceConstants

  validates_presence_of :email, :ip_address, :source
  validates_inclusion_of :opt_in, {in: [true, false]}
  validates_uniqueness_of :email
  validates_email_format_of :email

  validates_inclusion_of :source, in: EmailPreference::SOURCE_TYPES

  def email=(value)
    super(value&.strip&.downcase)
  end

  def self.upsert!(email:, opt_in:, ip_address:, source:, form_kind:)
    email_preference = EmailPreference.find_or_initialize_by(email: email)
    # Don't change opt_in to false if a preference with opt_in = true exists already.
    # We currently only enable a user to opt out via the Pardot unsubscribe link.
    if email_preference.new_record? || opt_in || !email_preference.opt_in
      email_preference.update!(
        email: email,
        opt_in: opt_in,
        ip_address: ip_address,
        source: source,
        form_kind: form_kind
      )
    end
    # This is a write-only helper method.  Don't return data to the caller.
    return
  end
end
