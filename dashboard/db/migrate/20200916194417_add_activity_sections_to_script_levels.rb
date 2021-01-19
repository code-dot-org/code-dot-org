class AddActivitySectionsToScriptLevels < ActiveRecord::Migration[5.0]
  def change
    add_column :script_levels, :activity_section_id, :integer
    add_index :script_levels, :activity_section_id
  end
end
