class AddNamedLevelToScriptLevel < ActiveRecord::Migration[4.2]
  def change
    add_column :script_levels, :named_level, :boolean
  end
end
