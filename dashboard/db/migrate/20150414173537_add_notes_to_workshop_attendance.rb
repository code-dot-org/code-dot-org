class AddNotesToWorkshopAttendance < ActiveRecord::Migration[4.2]
  def change
    add_column :workshop_attendance, :notes, :text
  end
end
