class AddFlexCategoryToStages < ActiveRecord::Migration[4.2]
  def change
    add_column :stages, :flex_category, :string
  end
end
