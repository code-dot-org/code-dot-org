class AddMirroredUnitToScripts < ActiveRecord::Migration[6.1]
  def change
    add_column :scripts, :mirrored_unit_id, :bigint
    add_index :scripts, :mirrored_unit_id
  end
end
