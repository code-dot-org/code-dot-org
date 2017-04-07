class AddScriptIdToContainedLevels < ActiveRecord::Migration[5.0]
  def change
    add_column :contained_levels, :script_id, :integer, after: :updated_at
  end
end
