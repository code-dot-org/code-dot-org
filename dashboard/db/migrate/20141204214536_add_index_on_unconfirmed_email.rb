class AddIndexOnUnconfirmedEmail < ActiveRecord::Migration
  def change
    add_index :users, :unconfirmed_email
  end
end
