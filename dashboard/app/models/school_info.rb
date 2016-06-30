# == Schema Information
#
# Table name: school_infos
#
#  id                    :integer          not null, primary key
#  name                  :string(255)
#  school_type           :string(255)
#  zip                   :integer
#  state                 :string(255)
#  school_district_id    :integer
#  school_district_other :boolean          default(FALSE)
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#
# Indexes
#
#  fk_rails_951bceb7e3  (school_district_id)
#
# Foreign Keys
#
#  fk_rails_951bceb7e3  (school_district_id => school_districts.id)
#

class SchoolInfo < ActiveRecord::Base

  SCHOOL_TYPES = [
    SCHOOL_TYPE_CHARTER = "charter",
    SCHOOL_TYPE_PRIVATE = "private",
    SCHOOL_TYPE_PUBLIC = "public",
    SCHOOL_TYPE_OTHER = "other"
  ]

  SCHOOL_STATE_OTHER = "other"

  # remap what the form has to what we write to here
  def school_zip=(input)
    self.zip = input
  end

  def school_state=(input)
    self.state = input
  end

  validate :validate_school_district
  validates :name, presence: true

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
