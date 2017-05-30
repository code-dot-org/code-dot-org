class AddBonusToScriptLevel < ActiveRecord::Migration[5.0]
  def change
    add_column :script_levels, :bonus, :boolean
  end
end
