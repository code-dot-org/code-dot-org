class CreateProjectStorageGeos < ActiveRecord::Migration[7.0]
  def change
    create_table :project_storage_geos do |t|
      t.references :storage, type: :integer, null: false, foreign_key: {to_table: ProjectStorage.table_name}, index: {unique: true}

      t.string :country
      t.string :state
      t.string :city
      t.string :postal_code

      t.timestamps
    end
  end
end
