class AddFulltextIndexToSchoolDistricts < ActiveRecord::Migration[5.0]
  def change
    add_index :school_districts, [:name, :city], type: :fulltext
  end
end
