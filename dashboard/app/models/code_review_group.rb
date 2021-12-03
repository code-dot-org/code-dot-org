# == Schema Information
#
# Table name: code_review_groups
#
#  id         :bigint           not null, primary key
#  section_id :bigint           not null
#  name       :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_code_review_groups_on_section_id  (section_id)
#
class CodeReviewGroup < ApplicationRecord
  # use dependent: :delete_all here because code_review_group_members is a join table and has no id column.
  has_many :members, class_name: 'CodeReviewGroupMember', dependent: :delete_all
  belongs_to :section
end
