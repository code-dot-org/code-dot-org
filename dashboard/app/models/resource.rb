# == Schema Information
#
# Table name: resources
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  url        :string(255)
#  embed_slug :string(255)
#  properties :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Resource < ApplicationRecord
end
