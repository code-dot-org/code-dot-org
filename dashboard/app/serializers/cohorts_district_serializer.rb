class CohortsDistrictSerializer < ActiveModel::Serializer
  attributes :id, :name, :location, :max_teachers

  def id
    object.district.id
  end

  def name
    object.district.name
  end

  def location
    object.district.location
  end

end
