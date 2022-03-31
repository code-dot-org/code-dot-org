# == Schema Information
#
# Table name: programming_classes
#
#  id                                  :bigint           not null, primary key
#  programming_environment_id          :integer
#  programming_environment_category_id :integer
#  key                                 :string(255)
#  name                                :string(255)
#  content                             :text(65535)
#  fields                              :text(65535)
#  examples                            :text(65535)
#  tips                                :text(65535)
#  syntax                              :string(255)
#  external_documentation              :string(255)
#  created_at                          :datetime         not null
#  updated_at                          :datetime         not null
#
# Indexes
#
#  index_programming_classes_on_key_and_category_id                 (key,programming_environment_category_id) UNIQUE
#  index_programming_classes_on_key_and_programming_environment_id  (key,programming_environment_id) UNIQUE
#
class ProgrammingClass < ApplicationRecord
  include CurriculumHelper

  belongs_to :programming_environment
  belongs_to :programming_environment_category

  validates_uniqueness_of :key, scope: :programming_environment_id, case_sensitive: false
  validate :validate_key_format

  def summarize_for_edit
    {
      id: id,
      key: key,
      name: name || '',
      content: content || '',
      examples: parsed_examples,
      fields: parsed_fields,
      tips: tips || '',
      syntax: syntax || '',
      external_documentation: external_documentation || '',
      categoryKey: programming_environment_category&.key || ''
    }
  end

  private

  def parsed_examples
    examples.blank? ? [] : JSON.parse(examples)
  end

  def parsed_fields
    fields.blank? ? [] : JSON.parse(fields)
  end
end
