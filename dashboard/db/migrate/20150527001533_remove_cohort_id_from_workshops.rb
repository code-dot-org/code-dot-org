class RemoveCohortIdFromWorkshops < ActiveRecord::Migration
  def change
    remove_column :workshops, :cohort_id, :integer
  end
end
