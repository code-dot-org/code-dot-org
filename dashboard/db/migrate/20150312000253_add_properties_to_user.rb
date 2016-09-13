class AddPropertiesToUser < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :properties, :text
  end
end
