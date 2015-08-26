# == Schema Information
#
# Table name: workshop_cohorts
#
#  id          :integer          not null, primary key
#  workshop_id :integer          not null
#  cohort_id   :integer          not null
#  created_at  :datetime
#  updated_at  :datetime
#

class WorkshopCohort < ActiveRecord::Base
  belongs_to :workshop
  belongs_to :cohort
end
