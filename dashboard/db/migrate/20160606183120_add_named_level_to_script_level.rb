class AddNamedLevelToScriptLevel < ActiveRecord::Migration
  def change
    add_column :script_levels, :named_level, :boolean
  end
end
