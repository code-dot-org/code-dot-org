class AddTemplateLevelToLevels < ActiveRecord::Migration[5.0]
  def change
    add_column :levels, :template_level_id, :integer
    add_index :levels, :template_level_id
  end
end
