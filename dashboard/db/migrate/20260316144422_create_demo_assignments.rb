class CreateDemoAssignments < ActiveRecord::Migration[7.0]
  def change
    create_table :demo_assignments do |t|
      t.string :demo_type, null: false
      t.string :section_name, null: false
      t.string :login_type, null: false
      t.string :participant_type, null: false
      t.json :grades, null: false
      t.string :unit_name, null: false
      t.string :unit_group_name, null: false
      t.json :demo_student_ids, null: false

      t.timestamps
    end

    add_index :demo_assignments, :demo_type, unique: true
  end
end
