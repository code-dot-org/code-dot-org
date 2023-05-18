class CreateParentalPermissionRequests < ActiveRecord::Migration[6.1]
  def change
    create_table :parental_permission_requests do |t|
      t.references(:user, null: false, type: :integer)
      t.string :parent_email, null: false
      t.string :uuid, null: false

      t.timestamps
    end
    add_foreign_key :parental_permission_requests, :users
  end
end
