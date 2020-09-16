class AddActivitySectionsToScriptLevels < ActiveRecord::Migration[5.0]
  def change
    add_column :script_levels, :activity_section_id, :integer
  end
end
