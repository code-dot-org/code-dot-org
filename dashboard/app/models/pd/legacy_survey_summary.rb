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
  export_to_analytics

  data_classification(
    id: :restricted,
    facilitator_id: :restricted,
    course: :restricted,
    subject: :restricted,
    data: :restricted,
    created_at: :restricted,
    updated_at: :restricted,
  )

  belongs_to :facilitator, class_name: 'User', optional: true
end
