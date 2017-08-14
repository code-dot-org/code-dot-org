class AddShareFlagToUser < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :sharing_allowed, :boolean, null: false, default: true
  end
end
