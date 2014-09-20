class AddStepModeToLevels < ActiveRecord::Migration
  def change
    add_column :levels, :step_mode, :Integer
  end
end
