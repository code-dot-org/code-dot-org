class CreateUserGeos < ActiveRecord::Migration
  def change
    create_table :user_geos do |t|
      t.references :user, index: true, unique: true, foreign_key: true, null: false
      t.integer :user_id
      t.timestamps null: false
      t.datetime :indexed_at, null: false
      t.string :ip_address
      t.string :city
      t.string :state
      t.string :country
      t.string :postal_code
      t.string :latitude_longitude
    end
  end
end
