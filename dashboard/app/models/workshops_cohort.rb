class WorkshopsCohort < ActiveRecord::Base
  self.table_name = 'workshop_cohorts'
  belongs_to :workshop
  belongs_to :cohort
end
