class RemoveFlexCategoryFromStages < ActiveRecord::Migration[5.0]
  def change
    remove_column :stages, :flex_category, :string
  end
end
