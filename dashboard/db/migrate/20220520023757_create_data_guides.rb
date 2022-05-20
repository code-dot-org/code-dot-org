class CreateDataGuides < ActiveRecord::Migration[6.0]
  def change
    create_table :data_guides do |t|
      t.string :key, null: false, index: {unique: true}
      t.string :name, index: true
      t.text :content
      t.timestamps
    end
  end
end
