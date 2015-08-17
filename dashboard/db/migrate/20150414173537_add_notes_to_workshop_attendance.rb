class AddNotesToWorkshopAttendance < ActiveRecord::Migration
  def change
    add_column :workshop_attendance, :notes, :text
  end
end
