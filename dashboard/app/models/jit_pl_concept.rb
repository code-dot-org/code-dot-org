# == Schema Information
#
# Table name: jit_pl_concepts
#
#  id           :bigint           not null, primary key
#  name         :string(255)
#  display_name :string(255)
#  properties   :text(65535)
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
class JitPlConcept < ApplicationRecord
  include SerializedProperties

  has_many :jit_pl_exemplars, dependent: :destroy
  has_many :jit_pl_misconceptions, dependent: :destroy
  has_and_belongs_to_many :lessons, join_table: :jit_pl_concepts_resources
  has_and_belongs_to_many :resources, join_table: :jit_pl_concepts_lessons
  has_and_belongs_to_many :rubrics, join_table: :jit_pl_concepts_rubrics

  serialized_attrs %w(
    text_content
  )
end
