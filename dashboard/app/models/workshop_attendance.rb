class WorkshopAttendance < ActiveRecord::Base
  self.table_name = 'workshop_attendance'
  belongs_to :segment
  belongs_to :teacher, class_name: 'User'

  def WorkshopAttendance.csv_attributes
    # same as in UserSerializer
    [:teacher_id, :status, :notes]
  end

  def to_csv
    WorkshopAttendance.csv_attributes.map{ |attr| self.send(attr) }
  end
end
