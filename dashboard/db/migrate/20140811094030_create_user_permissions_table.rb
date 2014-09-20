class CreateUserPermissionsTable < ActiveRecord::Migration
  def change
    create_table :user_permissions do |t|
      t.references :user, null:false
      t.string :permission, null:false
      t.timestamps
    end

    add_index :user_permissions, [:user_id, :permission], unique: true
  end
end
