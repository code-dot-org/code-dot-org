# == Schema Information
#
# Table name: demo_students
#
#  id         :bigint           not null, primary key
#  user_id    :integer          not null
#  demo_type  :string(255)      not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_demo_students_on_demo_type_and_user_id  (demo_type,user_id)
#  index_demo_students_on_user_id_and_demo_type  (user_id,demo_type) UNIQUE
#
class DemoStudent < ApplicationRecord
  belongs_to :user
  validates :demo_type, inclusion: {in: ->(_) {Policies::DemoSections::DEMO_TYPES.map(&:to_s)}}
  validates :user_id, uniqueness: {scope: :demo_type}
  validate :user_must_be_student

  after_commit :reset_policy_cache
  after_create_commit :lock_user_login!

  private def user_must_be_student
    return unless user
    errors.add(:user, 'must be a student') unless user.student?
  end

  private def reset_policy_cache
    Policies::DemoSections.reset_cache!
  end

  private def lock_user_login!
    require 'demo_students'
    DemoStudents.prevent_demo_student_login(user_id, demo_type)
  end
end
