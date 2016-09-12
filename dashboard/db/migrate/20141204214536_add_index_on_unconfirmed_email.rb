class AddIndexOnUnconfirmedEmail < ActiveRecord::Migration[4.2]
  def change
    add_index :users, :unconfirmed_email
  end
end
