# == Schema Information
#
# Table name: programming_expression_methods
#
#  id                        :bigint           not null, primary key
#  programming_expression_id :integer          not null
#  key                       :string(255)      not null
#  name                      :string(255)
#  syntax                    :string(255)
#  external_link             :string(255)
#  parameters                :text(65535)
#  examples                  :text(65535)
#  created_at                :datetime         not null
#  updated_at                :datetime         not null
#
# Indexes
#
#  index_programming_expression_methods_on_key_and_expression_id  (key,programming_expression_id) UNIQUE
#
class ProgrammingExpressionMethod < ApplicationRecord
end
