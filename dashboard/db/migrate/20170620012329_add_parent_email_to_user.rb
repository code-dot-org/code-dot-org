class AddParentEmailToUser < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :parent_email, :string, default: nil, after: :email
    add_index :users, :parent_email
  end
end
