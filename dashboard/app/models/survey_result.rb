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

class SurveyResult < ApplicationRecord
  include SerializedProperties

  SYSTEM_DELETED = 'system_deleted'.freeze

  ETHNICITIES = {
    "asian" => "Asian",
    "black" => "Black / African American",
    "hispanic" => "Hispanic / Latino / Latina",
    "american_indian" => "Native American / Alaskan",
    "hawaiian" => "Native Hawaiian / Pacific Islander",
    "white" => "White",
    "tr" => "Two or more races"
  }.freeze

  DIVERSITY_ATTRS = (ETHNICITIES.keys.map {|key| "diversity_#{key}"} + ['diversity_farm']).freeze

  NET_PROMOTER_SCORE_ATTRS = %w(nps_value nps_comment).freeze

  # Note: diversity_native is deprecated. It corresponded to the "Native Hawaiian
  # or Other Pacific Islander" option in the diversity survey for 2019 and earlier.
  FREE_RESPONSE_ATTRS = %w(nps_comment).freeze
  NON_FREE_RESPONSE_ATTRS = %w(
    diversity_white
    diversity_black
    diversity_hispanic
    diversity_asian
    diversity_native
    diversity_hawaiian
    diversity_american_indian
    diversity_other
    diversity_tr
    diversity_farm
    nps_value
  ).freeze
  ALL_ATTRS = (DIVERSITY_ATTRS + NET_PROMOTER_SCORE_ATTRS).freeze

  serialized_attrs ALL_ATTRS
  belongs_to :user

  KINDS = [
    DIVERSITY_2016 = 'Diversity2016'.freeze,
    DIVERSITY_2017 = 'Diversity2017'.freeze,
    DIVERSITY_2018 = 'Diversity2018'.freeze,
    DIVERSITY_2019 = 'Diversity2019'.freeze,
    DIVERSITY_2021 = 'Diversity2021'.freeze,
    NET_PROMOTER_SCORE_2015 = 'NetPromoterScore2015'.freeze,
    NET_PROMOTER_SCORE_2017 = 'NetPromoterScore2017'.freeze,
    NET_PROMOTER_SCORE_2019 = 'NetPromoterScore2019'.freeze,
    NET_PROMOTER_SCORE_2020 = 'NetPromoterScore2020'.freeze
  ].freeze
  validates :kind, inclusion: {in: KINDS}, allow_nil: false
end
