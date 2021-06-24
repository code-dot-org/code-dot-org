# == Schema Information
#
# Table name: code_review_comments
#
#  id               :bigint           not null, primary key
#  channel_token_id :integer          not null
#  project_version  :string(255)      not null
#  commenter_id     :integer          not null
#  comment          :text(16777215)
#  project_owner_id :integer
#  section_id       :integer
#  is_from_teacher  :boolean
#  is_resolved      :boolean
#  deleted_at       :datetime
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_code_review_comments_on_project_id_and_version  (channel_token_id,project_version)
#
class CodeReviewComment < ApplicationRecord
  acts_as_paranoid
end
