# == Schema Information
#
# Table name: programming_expressions
#
#  id                         :bigint           not null, primary key
#  name                       :string(255)      not null
#  category                   :string(255)
#  properties                 :text(65535)
#  programming_environment_id :bigint           not null
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#  key                        :string(255)      not null
#
# Indexes
#
#  index_programming_expressions_on_name_and_category           (name,category)
#  index_programming_expressions_on_programming_environment_id  (programming_environment_id)
#  key_programming_environment                                  (key,programming_environment_id) UNIQUE
#
class ProgrammingExpression < ApplicationRecord
  belongs_to :programming_environment
  has_and_belongs_to_many :lessons, join_table: :lessons_programming_expressions

  def summarize_for_edit
    {key: key, name: name, category: category, programmingEnvironmentName: programming_environment.name}
  end

  def summarize_for_lesson_show
    {name: name, link: "/docs/#{programming_environment.name}/#{key}/"}
  end
end
