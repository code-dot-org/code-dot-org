class AddUnitPrefixToUnitGroupUnit < ActiveRecord::Migration[6.1]
  def change
    add_column :course_scripts, :unit_prefix, :string
  end
end
