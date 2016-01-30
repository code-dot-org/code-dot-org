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
  belongs_to :user
end
