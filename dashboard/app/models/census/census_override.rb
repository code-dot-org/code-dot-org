# == Schema Information
#
# Table name: census_overrides
#
#  id          :integer          not null, primary key
#  school_id   :string(12)       not null
#  school_year :integer          not null
#  teaches_cs  :string(2)        not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  fk_rails_06131f8f87  (school_id)
#

class Census::CensusOverride < ApplicationRecord
  has_many :census_inaccuracy_investigations, class_name: 'Census::CensusInaccuracyInvestigation'
  belongs_to :school

  validates_presence_of :school
  validates :school_year, presence: true, numericality: {greater_than_or_equal_to: 2015, less_than_or_equal_to: 2030}

  enum teaches_cs: Census::CensusSummary::TEACHES
end
