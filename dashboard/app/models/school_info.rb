# == Schema Information
#
# Table name: school_infos
#
#  id                    :integer          not null, primary key
#  country               :string(255)
#  school_type           :string(255)
#  zip                   :integer
#  state                 :string(255)
#  school_district_id    :integer
#  school_district_other :boolean          default(FALSE)
#  school_district_name  :string(255)
#  school_id             :integer
#  school_other          :boolean          default(FALSE)
#  school_name           :string(255)
#  full_address          :string(255)
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#  validation_type       :string(255)      default("full"), not null
#
# Indexes
#
#  fk_rails_951bceb7e3              (school_district_id)
#  index_school_infos_on_school_id  (school_id)
#

class SchoolInfo < ActiveRecord::Base
  SCHOOL_TYPES = [
    SCHOOL_TYPE_CHARTER = "charter",
    SCHOOL_TYPE_PRIVATE = "private",
    SCHOOL_TYPE_PUBLIC = "public",
    SCHOOL_TYPE_HOMESCHOOL = "homeschool",
    SCHOOL_TYPE_AFTER_SCHOOL = "afterschool",
    SCHOOL_TYPE_OTHER = "other"
  ].freeze

  SCHOOL_STATE_OTHER = "other"

  VALIDATION_TYPES = [
    VALIDATION_FULL = 'full',
    VALIDATION_NONE = 'none'
  ].freeze

  belongs_to :school_district
  belongs_to :school

  # Remap what the form has (e.g. school_zip) to what we write to (e.g. zip)
  def school_zip=(input)
    self.zip = input
  end

  def school_state=(input)
    self.state = input
  end

  ATTRIBUTES = %w(
    country
    school_type
    state
    zip
    school_district_id
    school_district_other
    school_district_name
    school_id
    school_other
    school_name
    full_address
  )

  before_validation do
    ATTRIBUTES.each do |attr|
      self[attr] = nil if self[attr].blank?
    end
  end

  validate :validate_with_country
  validate :validate_without_country
  validate :validate_zip

  def complete?
    false # TODO: in progress (eric)
  end

  def should_validate?
    validation_type != VALIDATION_NONE
  end

  def validate_zip
    if zip
      errors.add(:zip, 'Invalid zip code') unless zip > 0
    end
  end

  # Validate records in the newer data format (see school_info_test.rb for details).
  # The following states are valid (from the spec at https://goo.gl/Gw57rL):
  #
  # Country “USA” + charter + State + District + School name [selected]
  # Country “USA” + charter + State + District + zip + School name “other” [typed]
  # Country “USA” + charter + State + District “other” [typed] + zip + School name [typed]
  # Country “USA” + private + State + zip + School name [typed]
  # Country “USA” + public + State + District + School name [selected]
  # Country “USA” + public + State + District + zip + School name “other” [typed]
  # Country “USA” + public + State + District “other” [typed] + zip + School name [typed]
  # Country “USA” + other + State + zip + School name [typed]
  # Non-USA Country + any school type + address + school name
  #
  # This method reports errors if the record has a country and is invalid.
  def validate_with_country
    return unless country && should_validate?
    country == 'US' ? validate_us : validate_non_us
  end

  def validate_non_us
    errors.add(:school_type, "is required") unless school_type
    errors.add(:school_name, "is required") unless school_name
    errors.add(:full_address, "is required") unless full_address

    errors.add(:state, "is forbidden") if state
    errors.add(:zip, "is forbidden") if zip
    errors.add(:school_district, "is forbidden") if school_district
    errors.add(:school_district_other, "is forbidden") if school_district_other
    errors.add(:school_district_name, "is forbidden") if school_district_name
    errors.add(:school, "is forbidden") if school
    errors.add(:school_other, "is forbidden") if school_other
  end

  def validate_us
    errors.add(:school_type, "is required") unless school_type
    validate_private_other if [SCHOOL_TYPE_PRIVATE, SCHOOL_TYPE_OTHER].include? school_type
    validate_public_charter if [SCHOOL_TYPE_PUBLIC, SCHOOL_TYPE_CHARTER].include? school_type
  end

  def validate_private_other
    errors.add(:state, "is required") unless state
    errors.add(:zip, "is required") unless zip
    errors.add(:school_name, "is required") unless school_name

    errors.add(:school_district, "is forbidden") if school_district
    errors.add(:school_district_other, "is forbidden") if school_district_other
    errors.add(:school_district_name, "is forbidden") if school_district_name
    errors.add(:school, "is forbidden") if school
    errors.add(:school_other, "is forbidden") if school_other
    errors.add(:full_address, "is forbidden") if full_address
  end

  def validate_public_charter
    errors.add(:state, "is required") unless state
    errors.add(:full_address, "is forbidden") if full_address
    validate_district
    validate_school
  end

  def validate_district
    if school_district_other
      errors.add(:school_district_name, "is required") unless school_district_name
      errors.add(:school_district, "is forbidden") if school_district
    else
      errors.add(:school_district, "is required") unless school_district
      errors.add(:school_district_name, "is forbidden") if school_district_name
    end
  end

  def validate_school
    if school_district_other
      errors.add(:zip, "is required") unless zip
      errors.add(:school_name, "is required") unless school_name
      errors.add(:school, "is forbidden") if school
      errors.add(:school_other, "is forbidden") if school_other
    elsif school_other
      errors.add(:school_name, "is required") unless school_name
      errors.add(:zip, "is required") unless zip
      errors.add(:school, "is forbidden") if school
    else
      errors.add(:school, "is required") unless school
      errors.add(:zip, "is forbidden") if zip
      errors.add(:school_name, "is forbidden") if school_name
    end
  end

  # validate records in the older data format (see school_info_test.rb for details).
  # This method reports errors if the record does NOT have a country and is invalid.
  def validate_without_country
    return unless should_validate?
    return if country

    # don't allow any new fields in the old data format.
    errors.add(:school_district_name, "is forbidden") if school_district_name
    errors.add(:school, "is forbidden") if school
    errors.add(:school_other, "is forbidden") if school_other
    errors.add(:school_name, "is forbidden") if school_name
    errors.add(:full_address, "is forbidden") if full_address

    validate_school_district_without_country
  end

  # Validates the district dropdown.  This list is more verbose than it
  # needs to be, but correlates to the list of valid configurations given
  # in https://github.com/code-dot-org/code-dot-org/pull/8624.
  def validate_school_district_without_country
    return if school_type == SCHOOL_TYPE_CHARTER && !zip.blank?
    return if school_type == SCHOOL_TYPE_PRIVATE && !zip.blank?
    if school_type == SCHOOL_TYPE_PUBLIC
      return if state == SCHOOL_STATE_OTHER
      return if !state.blank? && !school_district_id.blank?
      return if !state.blank? && school_district_id.blank? && !school_district_other.blank?
    elsif school_type == SCHOOL_TYPE_OTHER
      return if state == SCHOOL_STATE_OTHER
      return if !state.blank? && !school_district_id.blank?
      return if !state.blank? && school_district_id.blank? && !school_district_other.blank?
    end

    errors.add(:school_district, "is required")
  end
end
