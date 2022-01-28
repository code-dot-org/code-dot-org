class AddCategoryAndIsFeaturedToCourseOffering < ActiveRecord::Migration[5.2]
  def change
    add_column :course_offerings, :category, :string, null: false, default: 'other'
    add_column :course_offerings, :is_featured, :boolean, null: false, default: false
  end
end
