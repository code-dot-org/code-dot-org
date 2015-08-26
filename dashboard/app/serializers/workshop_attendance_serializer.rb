# == Schema Information
#
# Table name: workshop_attendance
#
#  id         :integer          not null, primary key
#  teacher_id :integer          not null
#  segment_id :integer          not null
#  status     :string(255)
#  created_at :datetime
#  updated_at :datetime
#  notes      :text
#
# Indexes
#
#  index_workshop_attendance_on_segment_id  (segment_id)
#  index_workshop_attendance_on_teacher_id  (teacher_id)
#

class WorkshopAttendanceSerializer < ActiveModel::Serializer
  attributes :id, :teacher_id, :segment_id, :status, :notes
end
