class RenameDataRetentionStatusesTable < ActiveRecord::Migration[6.1]
  def change
    rename_table :data_retention_statuses, :user_data_retention_statuses
  end
end
