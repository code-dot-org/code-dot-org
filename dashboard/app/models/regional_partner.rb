# == Schema Information
#
# Table name: regional_partners
#
#  id                 :integer          not null, primary key
#  name               :string(255)      not null
#  group              :integer
#  contact_id         :integer
#  urban              :boolean
#  attention          :string(255)
#  street             :string(255)
#  apartment_or_suite :string(255)
#  city               :string(255)
#  state              :string(255)
#  zip_code           :string(255)
#  phone_number       :string(255)
#  notes              :text(65535)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#
# Indexes
#
#  index_regional_partners_on_name_and_contact_id  (name,contact_id) UNIQUE
#

require 'state_abbr'
class RegionalPartner < ActiveRecord::Base
  belongs_to :contact, class_name: 'User'

  has_many :regional_partner_program_managers
  has_many :program_managers,
    class_name: 'User',
    through: :regional_partner_program_managers

  has_many :pd_workshops
  has_many :mappings, class_name: Pd::RegionalPartnerMapping, dependent: :destroy

  # Make sure the phone number contains at least 10 digits.
  # Allow any format and additional text, such as extensions.
  PHONE_NUMBER_VALIDATION_REGEX = /(\d.*){10}/

  ADDRESS_NOT_VERIFIED = "Address could not be verified. Please double-check."
  DOES_NOT_MATCH_ADDRESS = "doesn't match the address. Did you mean"
  INVALID_STREET_ADDRESS = "must be a valid street address (no PO boxes)"

  validates :name, length: {minimum: 1, maximum: 255}
  validates :group, numericality: {only_integer: true, greater_than: 0}, if: -> {group.present?}
  validates_format_of :phone_number, with: PHONE_NUMBER_VALIDATION_REGEX, if: -> {phone_number.present?}
  validates_inclusion_of :state, in: STATE_ABBR_WITH_DC_HASH.keys.map(&:to_s), if: -> {state.present?}
  validate :valid_address?, if: -> {street.present? && address_fields_changed?}

  def valid_address?
    # only run this validation once others pass
    return unless errors.empty?

    found = Geocoder.search(full_address)
    if found.empty?
      errors.add(:base, ADDRESS_NOT_VERIFIED)
    else
      if found.first.postal_code != zip_code
        errors.add(:zip_code, "#{DOES_NOT_MATCH_ADDRESS} #{found.first.postal_code}?")
      end
      if found.first.state_code != state
        errors.add(:state, "#{DOES_NOT_MATCH_ADDRESS} #{found.first.state_code}?")
      end
      unless found.first.street_number
        errors.add(:street, INVALID_STREET_ADDRESS)
      end
    end
  end

  def address_unverified?
    geocoder_errors = [ADDRESS_NOT_VERIFIED, DOES_NOT_MATCH_ADDRESS, INVALID_STREET_ADDRESS]
    errors.full_messages.any? do |error|
      geocoder_errors.any? do |geo_error|
        error.include?(geo_error)
      end
    end
  end

  def full_address
    [street, apartment_or_suite, city, state, zip_code].compact.join(', ')
  end

  def address_fields_changed?
    street_changed? || apartment_or_suite_changed? || city_changed? || state_changed? || zip_code_changed?
  end

  # assign a program manager to a regional partner
  def program_manager=(program_manager_id)
    program_manager = User.find(program_manager_id)
    program_managers << program_manager unless program_managers.include?(program_manager)
  end

  CSV_IMPORT_OPTIONS = {col_sep: "\t", headers: true}.freeze

  def self.find_or_create_all_from_tsv(filename)
    CSV.read(filename, CSV_IMPORT_OPTIONS).each do |row|
      params = {
        name: row['name'],
        group: row['group'],
      }
      RegionalPartner.where(params).first_or_create!
    end
  end
end
