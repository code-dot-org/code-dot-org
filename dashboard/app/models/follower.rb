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

  belongs_to :section
  has_one :user, through: :section
  belongs_to :student_user, foreign_key: "student_user_id", class_name: 'User'

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

  validate :cannot_follow_yourself, unless: -> {deleted?}
  validate :teacher_must_be_teacher, unless: -> {deleted?}
  validate :student_cannot_be_admin

  validates_presence_of :student_user, unless: -> {deleted?}
  validates_presence_of :section, unless: -> {deleted?}

  after_create :assign_script
  def assign_script
    student_user.assign_script(section.script) if section.script
  end
end
