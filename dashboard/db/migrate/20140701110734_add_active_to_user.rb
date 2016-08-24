class AddActiveToUser < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :active, :boolean, null: false, default: true
  end
end
