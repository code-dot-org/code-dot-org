# == Schema Information
#
# Table name: ap_cs_offerings
#
#  id          :integer          not null, primary key
#  school_code :string(6)        not null
#  course      :string(3)        not null
#  school_year :integer          not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_ap_cs_offerings_on_school_code_and_school_year_and_course  (school_code,school_year,course) UNIQUE
#

class Census::ApCsOffering < ApplicationRecord
  belongs_to :ap_school_code, foreign_key: :school_code, primary_key: :school_code, required: true
  has_one :school, through: :ap_school_code

  COURSES = {
    CSP: "CSP",
    CSA: "CSA",
  }.freeze

  validates_presence_of :course
  enum course: COURSES

  validates :school_year, presence: true, numericality: {greater_than_or_equal_to: 2017, less_than_or_equal_to: 2030}
end
