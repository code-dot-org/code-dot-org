class WorkshopAttendanceSerializer < ActiveModel::Serializer
  attributes :teacher_id, :segment_id, :status
end
