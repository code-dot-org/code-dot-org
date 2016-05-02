class AddFlexToStages < ActiveRecord::Migration
  def change
    add_column :stages, :flex, :string
  end
end
