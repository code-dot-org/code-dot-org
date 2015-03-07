class CohortSerializer < ActiveModel::Serializer
  attributes :id, :name, :program_type
  has_many :workshops
  has_many :districts
  has_many :teachers
end
