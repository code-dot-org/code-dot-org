# A Cohort is a group of teachers
class Cohort < ActiveRecord::Base
  # A Cohort attends multiple workshops
  has_many :workshops

  # A Cohort is associated with one or more Districts
  has_and_belongs_to_many :districts

  # Teachers can be in multiple cohorts
  has_and_belongs_to_many :teachers, class_name: 'User'

  # a teacher must belong to an eligible District in order to join a Cohort
  validate :validate_teachers
  def validate_teachers
    # All teachers in this cohort must have a district specified
    _teacher_ids = teacher_ids
    _teachers = User.where(id: _teacher_ids) # .joins(:district) doesn't work on the habtm collection directly for some reason
    teacher_districts = _teachers.joins(:district)
    errors.add(:teachers, "do not have a district specified: #{_teachers.joins(:district).where('districts_users.district_id', nil).map(&:email)}") unless
        teacher_districts.count == _teacher_ids.count

    # All teachers in this cohort must be in eligible districts
    teacher_district_ids = teacher_districts.group(:district_id).select(:district_id).map(&:district_id)
    ineligible_districts = (teacher_district_ids - district_ids)
    errors.add(:teachers, "are in ineligible districts for this cohort: #{District.where(id: ineligible_districts).map(&:name)}") unless
        ineligible_districts.empty?
  end
end
