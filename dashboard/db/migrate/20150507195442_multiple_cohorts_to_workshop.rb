class MultipleCohortsToWorkshop < ActiveRecord::Migration
  def change
    create_table :workshops_cohorts do |t|
      t.integer :workshop_id
      t.integer :cohort_id
      t.timestamps
    end
  end
end
