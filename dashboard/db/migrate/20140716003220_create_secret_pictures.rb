class CreateSecretPictures < ActiveRecord::Migration[4.2]
  def change
    create_table :secret_pictures do |t|
      t.string :name, null: false
      t.string :path, null: false
      t.timestamps

      t.index :name, unique: true
      t.index :path, unique: true
    end
  end
end
