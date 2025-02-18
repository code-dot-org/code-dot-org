class AddBeforeStateAndAfterStateToCAPUserEvents < ActiveRecord::Migration[6.1]
  def change
    add_column :cap_user_events, :state_before, :string, limit: 1
    add_column :cap_user_events, :state_after, :string, limit: 1
  end
end
