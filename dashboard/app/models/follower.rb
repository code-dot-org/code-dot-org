# == Schema Information
#
# Table name: followers
#
#  id              :integer          not null, primary key
#  student_user_id :integer          not null
#  created_at      :datetime
#  updated_at      :datetime
#  section_id      :integer
#  deleted_at      :datetime
#
# Indexes
#
#  index_followers_on_section_id_and_student_user_id  (section_id,student_user_id)
#  index_followers_on_student_user_id                 (student_user_id)
#

# Join table defining student-teacher relationships for Users
# (student_user is the student, user is the teacher)
class Follower < ApplicationRecord
  acts_as_paranoid

  belongs_to :section, optional: true
  has_one :user, through: :section
  belongs_to :student_user, class_name: 'User', optional: true
  has_one :code_review_group_member, dependent: :destroy
  has_one :code_review_group, through: :code_review_group_member

  accepts_nested_attributes_for :student_user

  # Controller code should actually prevent this from ever happening, but just in case.
  def cannot_follow_yourself
    errors.add(:student_user_id, "can't be yourself") if student_user_id == user.id
  end

  def teacher_must_be_teacher
    errors.add(:user, "must be a teacher") unless user.user_type == User::TYPE_TEACHER
  end

  def student_cannot_be_admin
    return unless student_user
    errors.add(:student_user, 'cannot be admin') if student_user.admin?
  end

  def pl_participant_cannot_have_family_name
    return unless section && student_user
    if section.pl_section? && student_user.family_name
      errors.add(:student_user, 'cannot have family_name as a PL participant')
    end
  end

  validate :cannot_follow_yourself, unless: -> {deleted?}
  validate :teacher_must_be_teacher, unless: -> {deleted?}
  validate :student_cannot_be_admin
  validate :pl_participant_cannot_have_family_name

  validates_presence_of :student_user, unless: -> {deleted?}
  validates_presence_of :section, unless: -> {deleted?}

  after_create :assign_script
  def assign_script
    student_user.assign_script(section.script) if section.script
  end

  after_destroy :remove_family_name, if: proc {DCDO.get('family-name-features', false)}
  def remove_family_name
    # If the student is in zero sections, and has a family name set,
    # remove the family name.
    if student_user.family_name && student_user.sections_as_student.empty?
      # can't remove keys from properties directly, so just set it to nil.
      student_user.family_name = nil
      student_user.save!
    end
  end
end
