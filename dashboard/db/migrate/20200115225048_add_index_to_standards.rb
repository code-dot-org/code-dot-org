class AddIndexToStandards < ActiveRecord::Migration[5.0]
  def change
    add_index :standards, [:organization, :organization_id], unique: true
  end
end
