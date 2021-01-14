class RemoveNameUrlIndexFromResources < ActiveRecord::Migration[5.2]
  def up
    remove_index :resources, [:name, :url]
  end

  def down
    add_index :resources, [:name, :url], type: :fulltext
  end
end
