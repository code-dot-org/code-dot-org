class RenameCAPColumnsInUsers < ActiveRecord::Migration[6.1]
  def change
    rename_column :users, :cap_state, :cap_status
    rename_column :users, :cap_state_date, :cap_status_date
  end
end
