class DropConfirmableColumns < ActiveRecord::Migration[5.0]
  def change
    remove_index :users, column: [:confirmation_token, :deleted_at]
    remove_index :users, column: [:unconfirmed_email, :deleted_at]
    remove_column :users, :confirmation_token, :string
    remove_column :users, :confirmed_at, :datetime
    remove_column :users, :confirmation_sent_at, :datetime
    remove_column :users, :unconfirmed_email, :string
  end
end
