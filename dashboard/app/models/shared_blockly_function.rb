# == Schema Information
#
# Table name: shared_blockly_functions
#
#  id          :integer          not null, primary key
#  name        :string(255)      not null
#  level_type  :string(255)
#  block_type  :integer          default("function"), not null
#  return      :string(255)
#  description :text(65535)
#  arguments   :text(65535)
#  stack       :text(65535)
#

class SharedBlocklyFunction < ApplicationRecord
  enum block_type: {
    function: 0,
    behavior: 1,
  }

  validates_presence_of :name
  validates_uniqueness_of :name

  before_save do
    self.block_type = 'behavior'
    self.level_type = 'GameLabJr'
  end
end
