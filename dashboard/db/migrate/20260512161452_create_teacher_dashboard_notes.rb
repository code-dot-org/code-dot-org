class CreateTeacherDashboardNotes < ActiveRecord::Migration[6.1]
  def change
    create_table :teacher_dashboard_notes do |t|
      t.integer :teacher_id, null: false
      t.integer :section_id
      t.boolean :shared_with_section, null: false, default: false
      t.boolean :shareable_globally, null: false, default: false
      t.string :context_type, null: false
      t.integer :unit_group_id
      t.integer :unit_id
      t.integer :lesson_id
      t.text :body, null: false
      t.integer :lock_version, null: false, default: 0
      t.timestamps
    end

    add_index :teacher_dashboard_notes, [:teacher_id, :context_type, :unit_group_id], name: 'idx_tdn_teacher_course'
    add_index :teacher_dashboard_notes, [:teacher_id, :context_type, :unit_id], name: 'idx_tdn_teacher_unit'
    add_index :teacher_dashboard_notes, [:teacher_id, :context_type, :lesson_id], name: 'idx_tdn_teacher_lesson'
    add_index :teacher_dashboard_notes, [:section_id, :shared_with_section], name: 'idx_tdn_section_shared'
    add_index :teacher_dashboard_notes, :shareable_globally, name: 'idx_tdn_shareable_global'
    add_index :teacher_dashboard_notes, :unit_group_id
    add_index :teacher_dashboard_notes, :unit_id
    add_index :teacher_dashboard_notes, :lesson_id

    add_foreign_key :teacher_dashboard_notes, :users, column: :teacher_id
    add_foreign_key :teacher_dashboard_notes, :sections
    add_foreign_key :teacher_dashboard_notes, :unit_groups
    add_foreign_key :teacher_dashboard_notes, :scripts, column: :unit_id
    add_foreign_key :teacher_dashboard_notes, :stages, column: :lesson_id
  end
end
