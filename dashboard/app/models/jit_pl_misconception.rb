# == Schema Information
#
# Table name: jit_pl_misconceptions
#
#  id                :bigint           not null, primary key
#  name              :string(255)
#  ai_context        :json
#  properties        :text(65535)
#  jit_pl_concept_id :bigint           not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_jit_pl_misconceptions_on_jit_pl_concept_id  (jit_pl_concept_id)
#
class JitPlMisconception < ApplicationRecord
  include SerializedProperties

  belongs_to :jit_pl_concept
  has_many :jit_pl_exemplars, dependent: :destroy
  has_and_belongs_to_many :resources, join_table: :jit_pl_misconceptions_resources

  serialized_attrs %w(
    text_content
  )

  def serialize
    {
      id: id,
      name: name,
      text_content: text_content,
      resources: resources.map(&:summarize_for_lesson_edit),
    }
  end
end
