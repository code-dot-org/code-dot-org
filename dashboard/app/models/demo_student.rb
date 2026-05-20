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
#  index_demo_students_on_demo_type              (demo_type)
#  index_demo_students_on_user_id                (user_id)
#  index_demo_students_on_user_id_and_demo_type  (user_id,demo_type) UNIQUE
#
class DemoStudent < ApplicationRecord
  belongs_to :user
  validates :demo_type, inclusion: {in: Policies::DemoSections::DEMO_TYPES.map(&:to_s)}
  validates :user_id, uniqueness: {scope: :demo_type}

  after_commit :reset_policy_cache

  private def reset_policy_cache
    Policies::DemoSections.reset_cache!
  end
end
