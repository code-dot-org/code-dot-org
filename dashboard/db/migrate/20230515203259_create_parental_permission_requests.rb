class CreateParentalPermissionRequests < ActiveRecord::Migration[6.1]
  def change
    create_table :parental_permission_requests do |t|
      t.belongs_to :user, foreign_key: true
      t.string :parent_email, null: false

      t.timestamps
    end
    add_index :parental_permission_requests, :user_id
  end
end
