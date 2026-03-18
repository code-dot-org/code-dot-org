# == Schema Information
#
# Table name: demo_assignments
#
#  id               :bigint           not null, primary key
#  demo_type        :string(255)      not null
#  section_name     :string(255)      not null
#  login_type       :string(255)      not null
#  participant_type :string(255)      not null
#  grades           :json             not null
#  unit_name        :string(255)      not null
#  unit_group_name  :string(255)      not null
#  demo_student_ids :json             not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_demo_assignments_on_demo_type  (demo_type) UNIQUE
#
class DemoAssignment < ApplicationRecord
  validates :demo_type, presence: true, uniqueness: true
  validates :section_name, presence: true
  validates :login_type, presence: true

  # Returns true if the given user id appears in any DemoAssignment's demo_student_ids.
  def self.demo_student?(user_id)
    exists?(["JSON_CONTAINS(demo_student_ids, ?)", user_id.to_s])
  end
end
