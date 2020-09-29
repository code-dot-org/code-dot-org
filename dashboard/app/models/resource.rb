# == Schema Information
#
# Table name: resources
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  url        :string(255)      not null
#  key        :string(255)      not null
#  properties :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_resources_on_key  (key) UNIQUE
#

class Resource < ApplicationRecord
end
