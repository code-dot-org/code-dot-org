# == Schema Information
#
# Table name: ib_cs_offerings
#
#  id          :integer          not null, primary key
#  school_code :string(6)        not null
#  level       :string(2)        not null
#  school_year :integer          not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_ib_cs_offerings_on_school_code_and_school_year_and_level  (school_code,school_year,level) UNIQUE
#

class Census::IbCsOffering < ApplicationRecord
  belongs_to :ib_school_code, foreign_key: :school_code, primary_key: :school_code, required: true
  has_one :school, through: :ib_school_code

  # IB offers two differnt CS course: Standard Level (SL) and Higher Level (HL)
  # http://www.ibo.org/programmes/diploma-programme/curriculum/sciences/computer-science/
  LEVELS = {
    HL: "HL",
    SL: "SL",
  }.freeze

  validates_presence_of :level
  enum level: LEVELS

  validates :school_year, presence: true, numericality: {greater_than_or_equal_to: 2017, less_than_or_equal_to: 2030}
end
