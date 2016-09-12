class DropExperimentActivity < ActiveRecord::Migration[4.2]
  def up
    # Since we do not recreate the table on rollback, we conditionally drop it
    # on its existence.
    drop_table :experiment_activities if ActiveRecord::Base.connection.table_exists? :experiment_activities
  end
end
