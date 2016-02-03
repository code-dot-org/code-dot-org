# == Schema Information
#
# Table name: districts
#
#  id         :integer          not null, primary key
#  name       :string(255)      not null
#  location   :string(255)
#  contact_id :integer
#  created_at :datetime
#  updated_at :datetime
#
# Indexes
#
#  index_districts_on_contact_id  (contact_id)
#  index_districts_on_name        (name)
#

class DistrictSerializer < ActiveModel::Serializer
  attributes :id, :name, :location
  belongs_to :contact, serializer: UserSerializer
end
