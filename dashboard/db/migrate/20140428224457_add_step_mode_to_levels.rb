class AddStepModeToLevels < ActiveRecord::Migration[4.2]
  def change
    add_column :levels, :step_mode, :Integer
  end
end
