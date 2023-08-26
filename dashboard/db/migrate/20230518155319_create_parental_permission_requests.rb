class CreateParentalPermissionRequests < ActiveRecord::Migration[6.1]
  def change
    create_table :parental_permission_requests do |t|
      t.references(:user, null: false, type: :integer)
      t.string :parent_email, null: false
      t.string :uuid, null: false, limit: 36
      t.integer :reminders_sent, null: false, default: 0

      t.timestamps
    end
    add_index :parental_permission_requests, :uuid
    add_foreign_key :parental_permission_requests, :users
  end
end
