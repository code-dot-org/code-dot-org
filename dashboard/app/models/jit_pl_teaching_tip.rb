# == Schema Information
#
# Table name: jit_pl_teaching_tips
#
#  id                :bigint           not null, primary key
#  name              :string(255)
#  properties        :text(65535)
#  jit_pl_concept_id :bigint           not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_jit_pl_teaching_tips_on_jit_pl_concept_id  (jit_pl_concept_id)
#
class JitPlTeachingTip < ApplicationRecord
  include SerializedProperties

  belongs_to :jit_pl_concept
  has_and_belongs_to_many :resources, join_table: :jit_pl_teaching_tips_resources

  serialized_attrs %w(
    text_content
  )
end
