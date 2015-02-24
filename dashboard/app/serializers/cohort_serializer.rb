class CohortSerializer < ActiveModel::Serializer
  root false
  attributes :id, :name
  has_many :workshops
  has_many :districts
  has_many :teachers
end
