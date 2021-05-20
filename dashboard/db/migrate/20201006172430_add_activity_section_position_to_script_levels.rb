class AddActivitySectionPositionToScriptLevels < ActiveRecord::Migration[5.0]
  def change
    add_column :script_levels, :activity_section_position, :integer
  end
end
