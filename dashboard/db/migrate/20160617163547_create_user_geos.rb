class CreateUserGeos < ActiveRecord::Migration[4.2]
  def change
    create_table :user_geos do |t|
      t.references :user, index: true, unique: true, foreign_key: true, null: false
      t.timestamps null: false
      t.datetime :indexed_at, null: false
      t.string :ip_address
      t.string :city
      t.string :state
      t.string :country
      t.string :postal_code
      t.decimal :latitude, precision: 8, scale: 6
      t.decimal :longitude, precision: 9, scale: 6
    end
  end
end
