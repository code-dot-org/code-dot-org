class CohortSerializer < ActiveModel::Serializer
  attributes :id, :name, :program_type
  has_many :workshops
  has_many :teachers

  attribute :districts
  def districts
    object.cohorts_districts.map{|cd| CohortsDistrictSerializer.new(cd).attributes}
  end

end
