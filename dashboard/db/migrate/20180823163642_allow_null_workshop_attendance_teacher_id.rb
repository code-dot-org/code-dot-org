class AllowNullWorkshopAttendanceTeacherId < ActiveRecord::Migration[5.0]
  def change
    change_column_null :workshop_attendance, :teacher_id, true
  end
end
