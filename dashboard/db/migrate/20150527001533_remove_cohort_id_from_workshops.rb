class RemoveCohortIdFromWorkshops < ActiveRecord::Migration[4.2]
  def change
    remove_column :workshops, :cohort_id, :integer
  end
end
