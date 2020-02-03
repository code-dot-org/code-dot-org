class AddStatusTimestampChangeLogToPdApplication < ActiveRecord::Migration[5.0]
  def change
    add_column :pd_applications, :status_timestamp_change_log, :text
  end
end
