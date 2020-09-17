class DropContactRollupsComparison < ActiveRecord::Migration[5.0]
  def up
    drop_table :contact_rollups_comparisons
  end

  def down
    raise ActiveRecord::IrreversibleMigration, 'Cannot recover the deleted table'
  end
end
