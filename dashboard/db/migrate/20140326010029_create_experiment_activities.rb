class CreateExperimentActivities < ActiveRecord::Migration[4.2]
  def change
    create_table :experiment_activities do |t|
      t.references :activity, null: false
      t.string :feedback_design

      t.timestamps
    end
  end
end
