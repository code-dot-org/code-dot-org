class AddCAPStateAndCAPStateDateToUsers < ActiveRecord::Migration[6.1]
  def up
    add_column :users, :cap_state, :string, limit: 1
    add_column :users, :cap_state_date, :datetime
    add_index :users, %i[cap_state cap_state_date]
  end

  def down
    remove_index :users, %i[cap_state cap_state_date]
    remove_column :users, :cap_state, :string
    remove_column :users, :cap_state_date, :datetime
  end
end
