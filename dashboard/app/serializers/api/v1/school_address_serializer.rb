class Api::V1::SchoolAddressSerializer < ActiveModel::Serializer
  attributes :id, :name, :city, :state, :zip
end
