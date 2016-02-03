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
#  notes      :text(65535)
#
# Indexes
#
#  index_workshop_attendance_on_segment_id  (segment_id)
#  index_workshop_attendance_on_teacher_id  (teacher_id)
#

class WorkshopAttendance < ActiveRecord::Base
  self.table_name = 'workshop_attendance'
  belongs_to :segment
  belongs_to :teacher, class_name: 'User'
end
