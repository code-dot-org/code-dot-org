class WorkshopCohort < ActiveRecord::Base
  belongs_to :workshop
  belongs_to :cohort
end
