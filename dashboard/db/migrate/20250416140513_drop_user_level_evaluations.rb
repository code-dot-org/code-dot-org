class DropUserLevelEvaluations < ActiveRecord::Migration[6.1]
  def change
    drop_table :user_level_evaluations if ActiveRecord::Base.connection.table_exists? :user_level_evaluations
  end
end
