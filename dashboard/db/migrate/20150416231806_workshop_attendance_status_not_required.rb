class WorkshopAttendanceStatusNotRequired < ActiveRecord::Migration[4.2]
  def change
    change_column_null :workshop_attendance, :status, true
  end
end
