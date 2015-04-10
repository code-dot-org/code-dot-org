class CohortsDistrict < ActiveRecord::Base
  belongs_to :cohort
  belongs_to :district
end
