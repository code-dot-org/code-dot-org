class AddInstructionTypeToScriptsAndCourses < ActiveRecord::Migration[5.2]
  def up
    add_column :scripts, :instruction_type, :string
    add_index :scripts, :instruction_type

    add_column :unit_groups, :instruction_type, :string, null: false, default: 'teacher_led'
    add_index :unit_groups, :instruction_type
  end

  def down
    remove_column :unit_groups, :instruction_type

    remove_column :scripts, :instruction_type
  end
end
