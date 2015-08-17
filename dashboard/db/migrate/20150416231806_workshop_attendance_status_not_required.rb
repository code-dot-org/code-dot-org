class WorkshopAttendanceStatusNotRequired < ActiveRecord::Migration
  def change
    change_column_null :workshop_attendance, :status, true
  end
end
