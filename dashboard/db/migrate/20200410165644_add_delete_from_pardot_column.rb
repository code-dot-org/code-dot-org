class AddDeleteFromPardotColumn < ActiveRecord::Migration[5.0]
  def change
    add_column :contact_rollups_pardot_memory, :marked_for_deletion_at, :datetime, after: :data_rejected_reason
    add_index :contact_rollups_pardot_memory, :marked_for_deletion_at
  end
end
