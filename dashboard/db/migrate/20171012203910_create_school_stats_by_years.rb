class CreateSchoolStatsByYears < ActiveRecord::Migration[5.0]
  def change
    create_table :school_stats_by_years, primary_key: [:school_id, :school_year] do |t|
      # Alternate composite key on school NCES ID and dataset year
      t.references :school, type: :string, limit: 12, foreign_key: true, null: false, comment: 'NCES public school ID'
      t.string :school_year, limit: 9, null: false, comment: 'School Year'

      # Data from Directory (v. 1a)
      t.string :grades_offered_lo, limit: 2, null: false, comment: 'Grades Offered - Lowest'
      t.string :grades_offered_hi, limit: 2, null: false, comment: 'Grades Offered - Highest'
      t.boolean :grade_pk_offered, null: false, comment: 'PK Grade Offered'
      t.boolean :grade_kg_offered, null: false, comment: 'KG Grade Offered'
      t.boolean :grade_01_offered, null: false, comment: 'Grade 01 Offered'
      t.boolean :grade_02_offered, null: false, comment: 'Grade 02 Offered'
      t.boolean :grade_03_offered, null: false, comment: 'Grade 03 Offered'
      t.boolean :grade_04_offered, null: false, comment: 'Grade 04 Offered'
      t.boolean :grade_05_offered, null: false, comment: 'Grade 05 Offered'
      t.boolean :grade_06_offered, null: false, comment: 'Grade 06 Offered'
      t.boolean :grade_07_offered, null: false, comment: 'Grade 07 Offered'
      t.boolean :grade_08_offered, null: false, comment: 'Grade 08 Offered'
      t.boolean :grade_09_offered, null: false, comment: 'Grade 09 Offered'
      t.boolean :grade_10_offered, null: false, comment: 'Grade 10 Offered'
      t.boolean :grade_11_offered, null: false, comment: 'Grade 11 Offered'
      t.boolean :grade_12_offered, null: false, comment: 'Grade 12 Offered'
      t.boolean :grade_13_offered, null: false, comment: 'Grade 13 Offered'
      t.string :virtual_status, limit: 14, null: false, comment: 'Virtual School Status'

      # Data from Membership (v. 1a)
      t.integer :students_total, null: false, comment: 'Total students, all grades (includes AE)'
      t.integer :student_am_count, null: false, comment: 'All Students - American Indian/Alaska Native'
      t.integer :student_as_count, null: false, comment: 'All Students - Asian'
      t.integer :student_hi_count, null: false, comment: 'All Students - Hispanic'
      t.integer :student_bl_count, null: false, comment: 'All Students - Black'
      t.integer :student_wh_count, null: false, comment: 'All Students - White'
      t.integer :student_hp_count, null: false, comment: 'All Students - Hawaiian Native/Pacific Islander'
      t.integer :student_tr_count, null: false, comment: 'All Students - Two or More Races'

      # Data from School Characteristics (v. 1a)
      t.string :title_i_status, limit: 1, null: false, comment: 'TITLE I status (code)'

      # Data from Lunch Program Eligibility (v. 1a)
      t.integer :frl_eligible_total, null: false, comment: 'Total of free and reduced-price lunch eligible'

      # Audit columns
      t.timestamps null: false
    end
  end
end
