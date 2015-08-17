class DistrictSerializer < ActiveModel::Serializer
  attributes :id, :name, :location
  belongs_to :contact, serializer: UserSerializer
end
