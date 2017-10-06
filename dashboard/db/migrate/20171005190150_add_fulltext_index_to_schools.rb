class AddFulltextIndexToSchools < ActiveRecord::Migration[5.0]
  def change
    add_index :schools, [:name, :city], type: :fulltext
    add_index :schools, :zip
  end
end
