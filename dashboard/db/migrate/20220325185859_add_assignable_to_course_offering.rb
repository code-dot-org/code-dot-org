class AddAssignableToCourseOffering < ActiveRecord::Migration[5.2]
  def change
    add_column :course_offerings, :assignable, :boolean, null: false, default: true
  end
end
