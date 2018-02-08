# == Schema Information
#
# Table name: census_submission_form_maps
#
#  id                   :integer          not null, primary key
#  census_submission_id :integer          not null
#  form_id              :integer          not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#
# Indexes
#
#  index_census_submission_form_maps_on_census_submission_id  (census_submission_id)
#  index_census_submission_form_maps_on_form_id               (form_id)
#

class Census::CensusSubmissionFormMap < ApplicationRecord
  belongs_to :census_submission

  validates_presence_of :census_submission
  validates_presence_of :form_id
end
