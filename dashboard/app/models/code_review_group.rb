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
  has_many :members, class_name: 'CodeReviewGroupMember', dependent: :destroy
end
