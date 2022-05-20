# == Schema Information
#
# Table name: data_guides
#
#  id         :bigint           not null, primary key
#  key        :string(255)      not null
#  name       :string(255)
#  content    :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_data_guides_on_key   (key) UNIQUE
#  index_data_guides_on_name  (name)
#
class DataGuide < ApplicationRecord
end
