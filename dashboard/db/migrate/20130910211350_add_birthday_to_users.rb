class AddBirthdayToUsers < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :birthday, :date
    add_column :users, :parent_email, :string

    remove_index :users, :email
    add_index :users, :email        # Can't be unique since we allow username only users , :unique => true
  end
end
