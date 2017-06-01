class AddCurrentSignInAtDeletedAtIndexToUser < ActiveRecord::Migration[5.0]
  def change
    add_index :users, :current_sign_in_at
    add_index :users, :deleted_at
  end
end
