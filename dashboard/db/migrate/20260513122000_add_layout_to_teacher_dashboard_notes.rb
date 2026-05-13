class AddLayoutToTeacherDashboardNotes < ActiveRecord::Migration[6.1]
  def change
    add_column :teacher_dashboard_notes, :note_layout_column, :integer, null: false, default: 0
    add_column :teacher_dashboard_notes, :note_position, :integer, null: false, default: 0
  end
end
