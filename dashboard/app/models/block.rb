# == Schema Information
#
# Table name: blocks
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  level_type :string(255)
#  properties :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Block < ApplicationRecord
  include SerializedProperties

  serialized_attrs %{
    config
    helperCode
  }
end
