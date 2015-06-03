class WorkshopAttendance < ActiveRecord::Base
  self.table_name = 'workshop_attendance'
  belongs_to :segment
  belongs_to :teacher, class_name: 'User'
end
