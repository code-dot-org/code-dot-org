# == Schema Information
#
# Table name: programming_environment_categories
#
#  id                         :bigint           not null, primary key
#  programming_environment_id :integer          not null
#  key                        :string(255)      not null
#  name                       :string(255)
#  color                      :string(255)
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#
# Indexes
#
#  index_programming_environment_categories_on_environment_id  (programming_environment_id)
#  index_programming_environment_categories_on_key_and_env_id  (key,programming_environment_id) UNIQUE
#
class ProgrammingEnvironmentCategory < ApplicationRecord
  belongs_to :programming_environment

  def serialize
    {
      key: key,
      name: name,
      color: color
    }
  end
end
