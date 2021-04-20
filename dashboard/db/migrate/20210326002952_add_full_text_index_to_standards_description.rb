class AddFullTextIndexToStandardsDescription < ActiveRecord::Migration[5.2]
  def change
    add_index :standards, :description, type: :fulltext
  end
end
