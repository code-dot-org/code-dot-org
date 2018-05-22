# == Schema Information
#
# Table name: blocks
#
#  id          :integer          not null, primary key
#  name        :string(255)
#  level_type  :string(255)
#  category    :text(65535)
#  config      :text(65535)
#  helper_code :text(65535)
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#

class Block < ApplicationRecord
  def block_options
    {
      name: name,
      config: JSON.parse(config),
      category: category,
      helperCode: helper_code,
    }
  end
end
