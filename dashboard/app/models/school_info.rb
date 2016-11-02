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
    SCHOOL_TYPE_OTHER = "other"
  ]

  SCHOOL_STATE_OTHER = "other"

  belongs_to :school_district

  # Remap what the form has (e.g. school_zip) to what we write to (e.g. zip)
  def school_zip=(input)
    self.zip = input
  end

  def school_state=(input)
    self.state = input
  end

  validate :validate_school_district

  # Validates the district dropdown.  This list is more verbose than it
  # needs to be, but correlates to the list of valid configurations given
  # in https://github.com/code-dot-org/code-dot-org/pull/8624.
  def validate_school_district
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
