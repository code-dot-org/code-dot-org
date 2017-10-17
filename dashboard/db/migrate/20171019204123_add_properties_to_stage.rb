class AddPropertiesToStage < ActiveRecord::Migration[5.0]
  def change
    add_column :stages, :properties, :text
  end
end
