class Api::V1::SchoolAddressSerializer < ActiveModel::Serializer
  attributes :id, :name, :city, :state, :zip, :school_district_id

  def name
    object.name.titleize
  end

  def city
    object.city.titleize
  end
end
