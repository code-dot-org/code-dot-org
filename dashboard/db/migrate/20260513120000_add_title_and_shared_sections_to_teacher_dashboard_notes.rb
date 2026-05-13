class AddTitleAndSharedSectionsToTeacherDashboardNotes < ActiveRecord::Migration[6.1]
  def change
    add_column :teacher_dashboard_notes, :title, :string

    create_table :teacher_dashboard_note_shared_sections do |t|
      t.references :teacher_dashboard_note,
        null: false,
        foreign_key: true,
        index: {name: 'index_teacher_note_shared_sections_on_note_id'}
      t.integer :section_id, null: false
      t.timestamps
    end

    add_foreign_key :teacher_dashboard_note_shared_sections, :sections
    add_index :teacher_dashboard_note_shared_sections,
      [:teacher_dashboard_note_id, :section_id],
      unique: true,
      name: 'index_teacher_note_shared_sections_unique'
    add_index :teacher_dashboard_note_shared_sections,
      :section_id,
      name: 'index_teacher_note_shared_sections_on_section_id'

    reversible do |dir|
      dir.up do
        execute <<~SQL.squish
          INSERT INTO teacher_dashboard_note_shared_sections (
            teacher_dashboard_note_id, section_id, created_at, updated_at
          )
          SELECT id, section_id, NOW(), NOW()
          FROM teacher_dashboard_notes
          WHERE shared_with_section = 1 AND section_id IS NOT NULL
        SQL
      end
    end
  end
end
