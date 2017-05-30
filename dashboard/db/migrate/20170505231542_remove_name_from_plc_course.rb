class RemoveNameFromPlcCourse < ActiveRecord::Migration[5.0]
  def change
    remove_column :plc_courses, :name, :string
  end
end
