class RemoveParentEmailFromUsers < ActiveRecord::Migration[4.2]
  def change
    remove_column :users, :parent_email, :string
  end
end
