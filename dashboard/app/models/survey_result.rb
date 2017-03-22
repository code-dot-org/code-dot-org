# == Schema Information
#
# Table name: survey_results
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  kind       :string(255)
#  properties :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_survey_results_on_kind     (kind)
#  index_survey_results_on_user_id  (user_id)
#

class SurveyResult < ActiveRecord::Base
  include SerializedProperties

  ETHNICITIES = {}
  ETHNICITIES["white"] = "White"
  ETHNICITIES["black"] = "Black or African American"
  ETHNICITIES["hispanic"] = "Hispanic or Latino"
  ETHNICITIES["asian"] = "Asian"
  ETHNICITIES["native"] = "Native Hawaiian or Other Pacific Islander"
  ETHNICITIES["american_indian"] =  "American Indian or Alaska Native"
  ETHNICITIES["other"] = "Other/Unknown"
  ETHNICITIES.freeze

  DIVERSITY_ATTRS = ETHNICITIES.keys.map{|key| "survey_ethnicity_#{key}"}
  DIVERSITY_ATTRS << "survey_foodstamps"
  DIVERSITY_ATTRS.freeze

  NET_PROMOTER_SCORE_ATTRS = %w(nps_value nps_comment)
  NET_PROMOTER_SCORE_ATTRS.freeze

  ALL_ATTRS = (DIVERSITY_ATTRS + NET_PROMOTER_SCORE_ATTRS).freeze

  serialized_attrs ALL_ATTRS
  belongs_to :user

  KINDS = [
    DIVERSITY_2016 = 'Diversity2016'.freeze,
    DIVERSITY_2017 = 'Diversity2017'.freeze,
    NET_PROMOTER_SCORE_2015 = 'NetPromoterScore2015'.freeze,
    NET_PROMOTER_SCORE_2017 = 'NetPromoterScore2017'.freeze
  ].freeze
  validates :kind, inclusion: {in: KINDS}, allow_nil: false
end
