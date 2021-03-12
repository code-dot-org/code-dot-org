class CreateFoormLibraries < ActiveRecord::Migration[5.2]
  def change
    create_table :foorm_libraries do |t|
      t.string :name, null: false
      t.integer :version, null: false
      t.boolean :published, null: false

      t.timestamps

      t.index [:name, :version], name: "index_foorm_libraries_on_multiple_fields", unique: true
    end
  end
end
