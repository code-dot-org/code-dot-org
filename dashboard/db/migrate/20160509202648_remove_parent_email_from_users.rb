class RemoveParentEmailFromUsers < ActiveRecord::Migration
  def change
    remove_column :users, :parent_email, :string
  end
end
