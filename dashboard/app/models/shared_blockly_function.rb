# == Schema Information
#
# Table name: shared_blockly_functions
#
#  id          :integer          not null, primary key
#  name        :string(255)      not null
#  description :text(65535)
#  arguments   :text(65535)
#  stack       :text(65535)
#

class SharedBlocklyFunction < ApplicationRecord
  validates_uniqueness_of :name
end
