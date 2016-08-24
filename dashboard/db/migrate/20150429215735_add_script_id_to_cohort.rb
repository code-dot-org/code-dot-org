class AddScriptIdToCohort < ActiveRecord::Migration[4.2]
  def change
    add_column :cohorts, :script_id, :integer
  end
end
