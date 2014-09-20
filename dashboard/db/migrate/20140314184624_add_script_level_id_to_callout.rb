class AddScriptLevelIdToCallout < ActiveRecord::Migration
  def change
    add_column :callouts, :script_level_id, :int
  end
end
