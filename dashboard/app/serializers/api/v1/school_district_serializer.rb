# == Schema Information
#
# Table name: school_districts
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  city       :string(255)
#  state      :string(255)
#  zip        :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Api::V1::SchoolDistrictSerializer < ActiveModel::Serializer
  attributes :id, :name, :city, :state, :zip
end
