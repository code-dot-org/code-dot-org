class AddHintAccessToUsers < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :hint_access, :boolean
  end
end
