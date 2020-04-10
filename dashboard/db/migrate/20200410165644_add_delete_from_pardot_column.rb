class AddDeleteFromPardotColumn < ActiveRecord::Migration[5.0]
  def change
    add_column :contact_rollups_pardot_memory, :delete_from_pardot, :boolean, after: :data_rejected_reason
    add_index :contact_rollups_pardot_memory, :delete_from_pardot
  end
end
