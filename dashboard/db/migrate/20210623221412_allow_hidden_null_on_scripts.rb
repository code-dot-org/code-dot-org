class AllowHiddenNullOnScripts < ActiveRecord::Migration[5.2]
  def up
    change_column_null :scripts, :hidden, true
  end

  def down
    change_column_null :scripts, :hidden, false
  end
end
