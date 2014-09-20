class AddHintAccessToUsers < ActiveRecord::Migration
  def change
    add_column :users, :hint_access, :boolean
  end
end
