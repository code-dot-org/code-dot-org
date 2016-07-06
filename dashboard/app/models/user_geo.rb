# == Schema Information
#
# Table name: user_geos
#
#  id          :integer          not null, primary key
#  user_id     :integer          not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  indexed_at  :datetime         not null
#  ip_address  :string(255)
#  city        :string(255)
#  state       :string(255)
#  country     :string(255)
#  postal_code :string(255)
#  latitude    :decimal(8, 6)
#  longitude   :decimal(9, 6)
#
# Indexes
#
#  index_user_geos_on_user_id  (user_id)
#

class UserGeo < ActiveRecord::Base
end
