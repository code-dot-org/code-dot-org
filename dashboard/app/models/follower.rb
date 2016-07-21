# == Schema Information
#
# Table name: followers
#
#  id              :integer          not null, primary key
#  user_id         :integer          not null
#  student_user_id :integer          not null
#  created_at      :datetime
#  updated_at      :datetime
#  section_id      :integer
#  deleted_at      :datetime
#
# Indexes
#
#  index_followers_on_section_id                   (section_id)
#  index_followers_on_student_user_id              (student_user_id)
#  index_followers_on_user_id_and_student_user_id  (user_id,student_user_id)
#

# Join table defining student-teacher relationships for Users
# (student_user is the student, user is the teacher)
class Follower < ActiveRecord::Base
  belongs_to :user
  belongs_to :student_user, foreign_key: "student_user_id", class_name: User
  belongs_to :section

  accepts_nested_attributes_for :student_user

  # controller code should actually prevent this from ever happening, but just in case..
  def cannot_follow_yourself
    errors.add(:student_user_id, "can't be yourself") if student_user_id == user_id
  end

  def teacher_must_be_teacher
    errors.add(:user_id, "must be a teacher") unless user.user_type == User::TYPE_TEACHER
  end

  def section_must_belong_to_teacher
    errors.add(:section_id, "must belong to teacher") unless user_id == user.id
  end

  validate :cannot_follow_yourself, :teacher_must_be_teacher, :section_must_belong_to_teacher

  validates_presence_of :user, :student_user, :section

  after_create :assign_script
  def assign_script
    student_user.assign_script(section.script) if section.script
  end
end
