class SegmentSerializer < ActiveModel::Serializer
  attributes :id, :start, :end, :workshop_id
end
