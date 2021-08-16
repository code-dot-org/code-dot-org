class AllowNullPublishedStateOnScripts < ActiveRecord::Migration[5.2]
  def up
    change_column_null :scripts, :published_state, true
  end

  def down
    change_column_null :scripts, :published_state, false, 'in_development'
  end
end
