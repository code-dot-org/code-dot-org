class CreateParentalPermissionRequests < ActiveRecord::Migration[6.1]
  def change
    create_table :parental_permission_requests do |t|
      t.integer :user_id, null: false
      t.string :parent_email, null: false

      t.timestamps
    end
    add_index :user_id
  end
end
