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
#  school_id             :string(12)
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

class SchoolInfo < ApplicationRecord
  SCHOOL_TYPES = [
    SCHOOL_TYPE_CHARTER = "charter".freeze,
    SCHOOL_TYPE_PRIVATE = "private".freeze,
    SCHOOL_TYPE_PUBLIC = "public".freeze,
    SCHOOL_TYPE_HOMESCHOOL = "homeschool".freeze,
    SCHOOL_TYPE_AFTER_SCHOOL = "afterschool".freeze,
    SCHOOL_TYPE_ORGANIZATION = "organization".freeze,
    SCHOOL_TYPE_OTHER = "other".freeze
  ].freeze

  SCHOOL_STATE_OTHER = "other"

  VALIDATION_TYPES = [
    VALIDATION_FULL = 'full'.freeze,
    VALIDATION_NONE = 'none'.freeze,
    VALIDATION_COMPLETE = 'complete'.freeze
  ].freeze

  belongs_to :school_district
  belongs_to :school

  has_and_belongs_to_many :census_submissions, class_name: 'Census::CensusSubmission'

  has_many :user_school_infos

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
  ).freeze

  before_validation do
    ATTRIBUTES.each do |attr|
      self[attr] = nil if self[attr].blank?
    end
  end

  # Only sync from school on create to avoid unintended updates to old data
  before_validation :sync_from_schools, on: :create

  # Set SchoolInfo to read-only.  readonly method overrides the default ActiveRecord::Core#readonly?
  def readonly?
    !new_record?
  end

  def sync_from_schools
    # If a SchoolInfo is linked to a School then the SchoolInfo pulls its data from the School
    # It seems like there is some code that is passing in mismatched data at times.
    # As of Nov. 2, 2017 there were 7 rows in school_infos with non-null school_id and conflicting
    # data between schools and school_infos. Until we better understand what is causing that we don't want
    # to flat out fail if we get conflicting inputs. Instead we overwrite the passed in fields with what
    # is on the School and report the mismatch to HoneyBadger.
    unless school.nil? && school_id.nil?
      original = {}
      original[:country] = country
      original[:school_type] = school_type
      original[:state] = state
      original[:zip] = zip
      original[:school_district_id] = school_district_id
      original[:school_district_other] = school_district_other
      original[:school_district_name] = school_district_name
      original[:school_other] = school_other
      original[:school_name] = school_name
      original[:full_address] = full_address

      self.country = 'US' # Everything in SCHOOLS is a US school
      self.school_type = school.school_type
      self.state = school.state
      self.zip = nil
      self.school_district = school.school_district
      self.school_district_other = nil
      self.school_district_name = nil
      self.school_other = nil
      self.school_name = nil
      self.full_address = nil
      self.validation_type = VALIDATION_FULL

      # Report if we are overriding a non-nil value that was originally passed in
      something_overwritten = original.map {|key, value| value && value != self[key]}.reduce {|acc, b| acc || b}
      if something_overwritten
        Honeybadger.notify(
          error_message: "Overwriting passed in data for new SchoolInfo",
          error_class: "SchoolInfo.sync_from_schools",
          context: {
            original_input: original,
            school_id: school.id
          }
        )
        # Don't interrupt callback chain by returning false
        return nil
      end
    end
  end

  validate :validate_with_country
  validate :validate_without_country
  validate :validate_zip
  validate :validate_complete

  def usa?
    ['US', 'USA', 'United States'].include? country
  end

  def should_check_for_full_validation?
    !(validation_type == VALIDATION_NONE || validation_type == VALIDATION_COMPLETE)
  end

  def validate_zip
    if zip
      errors.add(:zip, 'Invalid zip code') unless zip > 0 && zip < 100_000
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
    return unless country && should_check_for_full_validation?
    usa? ? validate_us : validate_non_us
  end

  def validate_non_us
    errors.add(:school_type, "is required") unless school_type
    errors.add(:school_type, "is invalid") unless SCHOOL_TYPES.include? school_type
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
    errors.add(:school_type, "is invalid") unless SCHOOL_TYPES.include? school_type
    validate_private_other if [SCHOOL_TYPE_PRIVATE, SCHOOL_TYPE_OTHER].include? school_type
    validate_public_charter if [SCHOOL_TYPE_PUBLIC, SCHOOL_TYPE_CHARTER].include? school_type
  end

  def validate_private_other
    errors.add(:state, "is required") unless state || school
    errors.add(:zip, "is required") unless zip || school
    errors.add(:school_name, "is required") unless school_name || school

    errors.add(:school_district, "is forbidden") if school_district
    errors.add(:school_district_other, "is forbidden") if school_district_other
    errors.add(:school_district_name, "is forbidden") if school_district_name
    errors.add(:school_other, "is forbidden") if school_other
    errors.add(:full_address, "is forbidden") if full_address
    validate_school if school
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
    return unless should_check_for_full_validation?
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

  def validate_complete
    return if validation_type != VALIDATION_COMPLETE || complete?

    errors.add(:country, "is required") if country.nil?
    errors.add(:school_name, "cannot be blank") if school_name.blank?
  end

  def effective_school_district_name
    school_district.try(:name) || school_district_name
  end

  def effective_school_name
    school.try(:name) || school_name
  end

  def private_school?
    school_type.eql? SCHOOL_TYPE_PRIVATE
  end

  def public_school?
    school_type.eql? SCHOOL_TYPE_PUBLIC
  end

  def charter_school?
    school_type.eql? SCHOOL_TYPE_CHARTER
  end

  # Decides whether the school info is complete enough to stop bugging the
  # teacher for additional information every week.  Different from complete
  # record validation.
  def complete?
    return true if school_id
    return false if country.nil?
    return true unless usa?
    return true if [
      SchoolInfo::SCHOOL_TYPE_HOMESCHOOL,
      SchoolInfo::SCHOOL_TYPE_AFTER_SCHOOL,
      SchoolInfo::SCHOOL_TYPE_ORGANIZATION,
      SchoolInfo::SCHOOL_TYPE_OTHER,
    ].include?(school_type)

    # Given we got past above cases, school name is sufficient
    !school_name.blank?
  end
end
