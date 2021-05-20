class AddSeedKeyToScriptLevels < ActiveRecord::Migration[5.0]
  def change
    add_column :script_levels, :seed_key, :string
    add_index :script_levels, :seed_key, unique: true
  end
end
