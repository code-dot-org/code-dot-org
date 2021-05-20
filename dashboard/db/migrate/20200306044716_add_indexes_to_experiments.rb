class AddIndexesToExperiments < ActiveRecord::Migration[5.0]
  def change
    add_index :experiments, :start_at
    add_index :experiments, :end_at
  end
end
