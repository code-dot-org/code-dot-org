class AddScriptIdToCohort < ActiveRecord::Migration
  def change
    add_column :cohorts, :script_id, :integer
  end
end
