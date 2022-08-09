class CreateDataDocs < ActiveRecord::Migration[6.0]
  def change
    create_table :data_docs do |t|
      t.string :key, null: false, index: {unique: true}
      t.string :name, index: true
      t.text :content
      t.timestamps
    end
  end
end
