# == Schema Information
#
# Table name: pd_legacy_survey_summaries
#
#  id             :integer          not null, primary key
#  facilitator_id :integer
#  course         :string(255)
#  subject        :string(255)
#  data           :text(65535)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#

class Pd::LegacySurveySummary < ApplicationRecord
  belongs_to :facilitator, class_name: 'User'
end
