# == Schema Information
#
# Table name: code_review_group_members
#
#  code_review_group_id :bigint           not null
#  follower_id          :bigint           not null, primary key
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#
# Indexes
#
#  index_code_review_group_members_on_code_review_group_id  (code_review_group_id)
#  index_code_review_group_members_on_follower_id           (follower_id)
#

# Join table.
# The logic here should be kept minimal, as it is used to join code_review_groups and followers.
class CodeReviewGroupMember < ApplicationRecord
  self.primary_key = :follower_id

  belongs_to :follower, required: true
  belongs_to :code_review_group, required: true

  def name
    return follower.student_user.name
  end
end
