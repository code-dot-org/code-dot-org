class WorkshopSerializer < ActiveModel::Serializer
  attributes :id, :name, :program_type, :location, :instructions
  has_many :segments
  has_many :facilitators, serializer: TeacherSerializer
end
