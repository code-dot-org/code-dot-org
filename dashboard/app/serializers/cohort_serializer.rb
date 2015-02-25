class CohortSerializer < ActiveModel::Serializer
  attributes :id, :name
  has_many :workshops
  has_many :districts
  has_many :teachers, serializer: TeacherSerializer
end
