class CreateLibrary < ActiveRecord::Migration[5.0]
  def change
    create_table :libraries do |t|
      t.string :name, index: true, null: false
      t.mediumtext :content
    end
  end
end
