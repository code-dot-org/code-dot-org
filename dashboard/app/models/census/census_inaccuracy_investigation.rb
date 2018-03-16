# == Schema Information
#
# Table name: census_inaccuracy_investigations
#
#  id                   :integer          not null, primary key
#  user_id              :integer          not null
#  notes                :text(65535)      not null
#  census_submission_id :integer          not null
#  census_override_id   :integer
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#
# Indexes
#
#  fk_rails_18600827a9  (census_submission_id)
#  fk_rails_465d31c61e  (census_override_id)
#  fk_rails_9c9f685588  (user_id)
#

class Census::CensusInaccuracyInvestigation < ApplicationRecord
  belongs_to :census_submission, class_name: 'Census::CensusSubmission'
  belongs_to :census_override, class_name: 'Census::CensusOverride'
  belongs_to :user

  validates_presence_of :census_submission
  validates_presence_of :user
  validates_presence_of :notes
end
