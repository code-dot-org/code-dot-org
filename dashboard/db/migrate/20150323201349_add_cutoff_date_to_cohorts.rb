class AddCutoffDateToCohorts < ActiveRecord::Migration[4.2]
  def change
    add_column :cohorts, :cutoff_date, :datetime
  end
end
