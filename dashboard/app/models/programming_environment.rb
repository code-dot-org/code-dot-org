# == Schema Information
#
# Table name: programming_environments
#
#  id         :bigint           not null, primary key
#  name       :string(255)      not null
#  properties :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
class ProgrammingEnvironment < ApplicationRecord
  has_many :programming_expressions
end
