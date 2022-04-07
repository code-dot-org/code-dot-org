# == Schema Information
#
# Table name: programming_methods
#
#  id                   :bigint           not null, primary key
#  programming_class_id :integer
#  key                  :string(255)
#  position             :integer
#  name                 :string(255)
#  content              :text(65535)
#  parameters           :text(65535)
#  examples             :text(65535)
#  syntax               :string(255)
#  external_link        :string(255)
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  overloaded_by        :string(255)
#
# Indexes
#
#  index_programming_methods_on_key_and_programming_class_id  (key,programming_class_id) UNIQUE
#
class ProgrammingMethod < ApplicationRecord
end
