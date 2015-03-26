class AddCutoffDateToCohorts < ActiveRecord::Migration
  def change
    add_column :cohorts, :cutoff_date, :datetime
  end
end
