class CreateProjectStorageGeos < ActiveRecord::Migration[7.0]
  def change
    create_table :project_storage_geos do |t|
      t.references :storage, type: :integer, null: false, foreign_key: {to_table: ProjectStorage.table_name}, index: {unique: true}

      t.string :ip_address, null: false
      t.string :country
      t.string :state
      t.string :city
      t.string :postal_code
      t.decimal :latitude, precision: 8, scale: 6
      t.decimal :longitude, precision: 9, scale: 6

      t.timestamps
    end
  end
end
