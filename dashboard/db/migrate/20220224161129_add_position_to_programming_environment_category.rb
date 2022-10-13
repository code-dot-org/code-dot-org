class AddPositionToProgrammingEnvironmentCategory < ActiveRecord::Migration[5.2]
  def change
    add_column :programming_environment_categories, :position, :integer
  end
end
