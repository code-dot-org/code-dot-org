class CreateTeacherDashboardNoteLayouts < ActiveRecord::Migration[6.1]
  def change
    create_table :teacher_dashboard_note_layouts do |t|
      t.references :teacher_dashboard_note,
        null: false,
        foreign_key: true,
        index: {name: 'index_teacher_note_layouts_on_note_id'}
      t.integer :teacher_id, null: false
      t.integer :note_layout_column, null: false, default: 0
      t.integer :note_position, null: false, default: 0
      t.timestamps
    end

    add_foreign_key :teacher_dashboard_note_layouts, :users, column: :teacher_id
    add_index :teacher_dashboard_note_layouts,
      [:teacher_dashboard_note_id, :teacher_id],
      unique: true,
      name: 'index_teacher_note_layouts_unique'
    add_index :teacher_dashboard_note_layouts,
      :teacher_id,
      name: 'index_teacher_note_layouts_on_teacher_id'
  end
end
