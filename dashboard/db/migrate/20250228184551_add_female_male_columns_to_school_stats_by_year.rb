class AddFemaleMaleColumnsToSchoolStatsByYear < ActiveRecord::Migration[6.1]
  def change
    add_column :school_stats_by_years, :student_female, :integer
    add_column :school_stats_by_years, :student_male, :integer
  end
end
