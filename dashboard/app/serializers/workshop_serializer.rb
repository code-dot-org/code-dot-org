class WorkshopSerializer < ActiveModel::Serializer
  attributes :id, :name, :program_type, :location, :instructions, :cohort_id
  has_many :segments
  has_many :facilitators, serializer: UserSerializer
end
