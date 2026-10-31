class CreateObjectivesScriptLevels < ActiveRecord::Migration[7.0]
  def change
    create_table :objectives_script_levels, id: false, charset: "utf8mb4", collation: "utf8mb4_unicode_ci" do |t|
      # Both referenced primary keys are int, not bigint.
      t.integer :script_level_id, null: false
      t.integer :objective_id, null: false

      # The default name for the composite index runs past MySQL's 64-character
      # limit, so both are named here.
      t.index [:script_level_id, :objective_id],
        unique: true,
        name: 'index_objectives_script_levels_on_sl_and_objective_ids'
      t.index :objective_id, name: 'index_objectives_script_levels_on_objective_id'
    end
  end
end
