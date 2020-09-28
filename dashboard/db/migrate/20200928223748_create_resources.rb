class CreateResources < ActiveRecord::Migration[5.0]
  def change
    create_table :resources do |t|
      t.string :name
      t.string :url
      t.string :embed_slug
      t.string :properties

      t.timestamps
    end
  end
end
