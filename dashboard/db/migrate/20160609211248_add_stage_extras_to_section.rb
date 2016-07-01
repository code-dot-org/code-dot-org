class AddStageExtrasToSection < ActiveRecord::Migration
  def change
    add_column :sections, :stage_extras, :boolean, null: false, default: false
  end
end
