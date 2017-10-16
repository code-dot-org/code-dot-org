# == Schema Information
#
# Table name: school_stats_by_years
#
#  school_id          :string(12)       not null, primary key
#  school_year        :string(9)        not null, primary key
#  grades_offered_lo  :string(2)        not null
#  grades_offered_hi  :string(2)        not null
#  grade_pk_offered   :boolean          not null
#  grade_kg_offered   :boolean          not null
#  grade_01_offered   :boolean          not null
#  grade_02_offered   :boolean          not null
#  grade_03_offered   :boolean          not null
#  grade_04_offered   :boolean          not null
#  grade_05_offered   :boolean          not null
#  grade_06_offered   :boolean          not null
#  grade_07_offered   :boolean          not null
#  grade_08_offered   :boolean          not null
#  grade_09_offered   :boolean          not null
#  grade_10_offered   :boolean          not null
#  grade_11_offered   :boolean          not null
#  grade_12_offered   :boolean          not null
#  grade_13_offered   :boolean          not null
#  virtual_status     :string(14)       not null
#  students_total     :integer          not null
#  student_am_count   :integer          not null
#  student_as_count   :integer          not null
#  student_hi_count   :integer          not null
#  student_bl_count   :integer          not null
#  student_wh_count   :integer          not null
#  student_hp_count   :integer          not null
#  student_tr_count   :integer          not null
#  title_i_status     :string(1)        not null
#  frl_eligible_total :integer          not null
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#
# Indexes
#
#  index_school_stats_by_years_on_school_id  (school_id)
#

class SchoolStatsByYear < ActiveRecord::Base
  self.primary_keys = :school_id, :school_year
  belongs_to :school
end
