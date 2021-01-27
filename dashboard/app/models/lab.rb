# == Schema Information
#
# Table name: labs
#
#  id         :bigint           not null, primary key
#  key        :string(255)      not null
#  name       :string(255)      not null
#  properties :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
class Lab < ApplicationRecord
end
