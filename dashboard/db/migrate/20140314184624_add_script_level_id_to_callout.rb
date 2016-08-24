class AddScriptLevelIdToCallout < ActiveRecord::Migration[4.2]
  def change
    add_column :callouts, :script_level_id, :int
  end
end
