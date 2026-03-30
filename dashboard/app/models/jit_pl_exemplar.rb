# == Schema Information
#
# Table name: jit_pl_exemplars
#
#  id                      :bigint           not null, primary key
#  name                    :string(255)
#  properties              :text(65535)
#  jit_pl_concept_id       :bigint
#  jit_pl_misconception_id :bigint
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#
# Indexes
#
#  index_jit_pl_exemplars_on_jit_pl_concept_id        (jit_pl_concept_id)
#  index_jit_pl_exemplars_on_jit_pl_misconception_id  (jit_pl_misconception_id)
#
class JitPlExemplar < ApplicationRecord
  include SerializedProperties

  belongs_to :jit_pl_concept, optional: true
  belongs_to :jit_pl_misconception, optional: true
  has_and_belongs_to_many :resources, join_table: :jit_pl_exemplars_resources

  serialized_attrs %w(
    code_content
    text_content
    exemplar_type
  )

  def serialize
    {
      id: id,
      name: name,
      text_content: text_content,
      code_content: code_content,
      exemplar_type: exemplar_type,
      resources: resources.map(&:summarize_for_lesson_edit),
    }
  end
end
