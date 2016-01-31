# == Schema Information
#
# Table name: survey_results
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  properties :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_survey_results_on_user_id  (user_id)
#

class SurveyResult < ActiveRecord::Base
  include SerializedProperties
  serialized_attrs %w(survey2016_ethnicity_indian survey2016_ethnicity_asian survey2016_ethnicity_black survey2016_ethnicity_hispanic survey2016_ethnicity_hawaiian survey2016_ethnicity_white survey2016_foodstamps)
  belongs_to :user
end
