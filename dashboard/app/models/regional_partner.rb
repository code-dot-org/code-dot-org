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
  has_many :regional_partner_program_managers
  has_many :program_managers,
    class_name: 'User',
    through: :regional_partner_program_managers

  has_many :pd_workshops_organized, class_name: 'Pd::Workshop', through: :regional_partner_program_managers
  has_many :mappings, -> {order :state, :zip_code}, class_name: Pd::RegionalPartnerMapping, dependent: :destroy

  # Upcoming and not ended
  def future_pd_workshops_organized
    pd_workshops_organized.future
  end

  # Make sure the phone number contains at least 10 digits.
  # Allow any format and additional text, such as extensions.
  PHONE_NUMBER_VALIDATION_REGEX = /(\d.*){10}/

  validates :name, length: {minimum: 1, maximum: 255}
  validates :group, numericality: {only_integer: true, greater_than: 0}, if: -> {group.present?}
  validates_format_of :phone_number, with: PHONE_NUMBER_VALIDATION_REGEX, if: -> {phone_number.present?}
  validates :zip_code, us_zip_code: true, if: -> {zip_code.present?}
  validates_inclusion_of :state, in: STATE_ABBR_WITH_DC_HASH.keys.map(&:to_s), if: -> {state.present?}

  # assign a program manager to a regional partner
  def program_manager=(program_manager_id)
    regional_partner_program_managers << regional_partner_program_managers.find_or_create_by!(
      regional_partner_id: id,
      program_manager_id: program_manager_id
    )
  end

  def contact
    User.find(read_attribute(contact_id)) || program_managers.first
  end

  def contact=(user)
    write_attribute(:contact_id, user.id)
  end

  # find a Regional Partner that services a particular region
  # @param [String] zip_code
  # @param [String] state - 2-letter state code
  def self.find_by_region(zip_code, state)
    return nil if zip_code.nil? && state.nil?

    base_query = RegionalPartner.joins(:mappings)
    state_query = base_query.where(pd_regional_partner_mappings: {state: state}) if state
    zip_code_query = base_query.where(pd_regional_partner_mappings: {zip_code: zip_code}) if zip_code

    find_by_region_query =
      if state && zip_code.nil?
        state_query
      elsif state.nil? && zip_code
        zip_code_query
      elsif state && zip_code
        state_query.or(zip_code_query)
      end

    # prefer match by zip code when multiple partners cover the same state
    return find_by_region_query.order('pd_regional_partner_mappings.zip_code IS NOT NULL DESC').first
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
