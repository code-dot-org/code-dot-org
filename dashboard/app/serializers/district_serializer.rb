class DistrictSerializer < ActiveModel::Serializer
  attributes :id, :name, :location, :contact_id
end
