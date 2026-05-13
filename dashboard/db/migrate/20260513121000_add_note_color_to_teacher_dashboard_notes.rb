class AddNoteColorToTeacherDashboardNotes < ActiveRecord::Migration[6.1]
  def change
    add_column :teacher_dashboard_notes, :note_color, :string, null: false, default: 'white'
  end
end
