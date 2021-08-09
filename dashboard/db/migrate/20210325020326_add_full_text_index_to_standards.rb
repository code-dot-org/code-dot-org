class AddFullTextIndexToStandards < ActiveRecord::Migration[5.2]
  def change
    add_index :standards, [:shortcode, :description], type: :fulltext
  end
end
