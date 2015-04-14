class WorkshopAttendanceSerializer < ActiveModel::Serializer
  attributes :id, :teacher_id, :segment_id, :status, :notes
end
