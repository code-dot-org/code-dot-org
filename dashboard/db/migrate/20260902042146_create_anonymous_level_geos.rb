class CreateAnonymousLevelGeos < ActiveRecord::Migration[7.0]
  def change
    create_table :anonymous_level_geos do |t|
      t.string :anon_user_id, limit: 36, null: false, index: {unique: true}

      t.string :country
      t.string :state
      t.string :city
      t.string :postal_code

      t.timestamps
    end
  end
end
