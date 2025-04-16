class AddStatusSchoolStatsByYears < ActiveRecord::Migration[6.1]
  def change
    add_column :school_stats_by_years, :status, :string
  end
end
