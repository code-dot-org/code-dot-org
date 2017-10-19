class ChangeCountsToNullInSchoolStatsByYears < ActiveRecord::Migration[5.0]
  def up
    change_column :school_stats_by_years, :students_total, :integer, null: true, comment: 'Total students, all grades (includes AE)'
    change_column :school_stats_by_years, :student_am_count, :integer, null: true, comment: 'All Students - American Indian/Alaska Native'
    change_column :school_stats_by_years, :student_as_count, :integer, null: true, comment: 'All Students - Asian'
    change_column :school_stats_by_years, :student_hi_count, :integer, null: true, comment: 'All Students - Hispanic'
    change_column :school_stats_by_years, :student_bl_count, :integer, null: true, comment: 'All Students - Black'
    change_column :school_stats_by_years, :student_wh_count, :integer, null: true, comment: 'All Students - White'
    change_column :school_stats_by_years, :student_hp_count, :integer, null: true, comment: 'All Students - Hawaiian Native/Pacific Islander'
    change_column :school_stats_by_years, :student_tr_count, :integer, null: true, comment: 'All Students - Two or More Races'
    change_column :school_stats_by_years, :title_i_status, :string, limit: 1, null: true, comment: 'TITLE I status (code)'
    change_column :school_stats_by_years, :frl_eligible_total, :integer, null: true, comment: 'Total of free and reduced-price lunch eligible'
  end

  def down
    change_column :school_stats_by_years, :students_total, :integer, null: false, comment: 'Total students, all grades (includes AE)'
    change_column :school_stats_by_years, :student_am_count, :integer, null: false, comment: 'All Students - American Indian/Alaska Native'
    change_column :school_stats_by_years, :student_as_count, :integer, null: false, comment: 'All Students - Asian'
    change_column :school_stats_by_years, :student_hi_count, :integer, null: false, comment: 'All Students - Hispanic'
    change_column :school_stats_by_years, :student_bl_count, :integer, null: false, comment: 'All Students - Black'
    change_column :school_stats_by_years, :student_wh_count, :integer, null: false, comment: 'All Students - White'
    change_column :school_stats_by_years, :student_hp_count, :integer, null: false, comment: 'All Students - Hawaiian Native/Pacific Islander'
    change_column :school_stats_by_years, :student_tr_count, :integer, null: false, comment: 'All Students - Two or More Races'
    change_column :school_stats_by_years, :title_i_status, :string, limit: 1, null: false, comment: 'TITLE I status (code)'
    change_column :school_stats_by_years, :frl_eligible_total, :integer, null: false, comment: 'Total of free and reduced-price lunch eligible'
  end
end
