class MultipleCohortsToWorkshop < ActiveRecord::Migration
  def change
    create_table :workshop_cohorts do |t|
      t.integer :workshop_id, null: false
      t.integer :cohort_id, null: false
      t.timestamps
    end
  end
end
