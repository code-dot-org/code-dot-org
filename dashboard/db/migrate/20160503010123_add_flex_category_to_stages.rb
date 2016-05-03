class AddFlexCategoryToStages < ActiveRecord::Migration
  def change
    add_column :stages, :flex_category, :string
  end
end
