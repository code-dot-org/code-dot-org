class CreateAuthenticationOptions < ActiveRecord::Migration[5.0]
  def change
    create_table :authentication_options do |t|
      t.string :email, null: false, default: ''
      t.string :hashed_email, null: false, default: ''
      t.string :credential_type, null: false
      t.string :authentication_id, null: true
      t.string :data, null: true
      t.datetime :deleted_at, null: true

      t.belongs_to :user, null: false, index: false
      t.index [:credential_type, :authentication_id, :deleted_at], unique: true, name: 'index_auth_on_cred_type_and_auth_id'
      t.index [:email, :deleted_at]
      t.index [:hashed_email, :deleted_at]
      t.index [:user_id, :deleted_at]

      t.timestamps
    end
  end
end
