class AddFooToRubrics < ActiveRecord::Migration[7.0]
  def change
    add_column :rubrics, :foo, :string
  end
end
