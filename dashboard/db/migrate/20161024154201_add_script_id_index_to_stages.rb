class AddScriptIdIndexToStages < ActiveRecord::Migration[5.0]
  def change
    change_table(:stages) do |t|
      t.index :script_id
    end
  end
end
