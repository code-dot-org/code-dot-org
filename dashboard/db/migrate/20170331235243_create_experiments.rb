class CreateExperiments < ActiveRecord::Migration[5.0]
  def change
    create_table :experiments do |t|
      t.string :name
      t.string :type
      t.datetime :start_time
      t.datetime :end_time

      t.timestamps
    end
  end
end
