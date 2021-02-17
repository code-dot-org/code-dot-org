# == Schema Information
#
# Table name: programming_expressions
#
#  id         :bigint           not null, primary key
#  name       :string(255)      not null
#  category   :string(255)
#  properties :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
class ProgrammingExpression < ApplicationRecord
  belongs_to :programming_environment
end
