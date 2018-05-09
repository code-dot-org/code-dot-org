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

  def email=(value)
    super(value&.strip&.downcase)
  end

  def self.upsert!(email:, opt_in:, ip_address:, source:, form_kind:)
    EmailPreference.find_or_initialize_by(email: email).update!(
      email: email,
      opt_in: opt_in,
      ip_address: ip_address,
      source: source,
      form_kind: form_kind
    )
  end
end
