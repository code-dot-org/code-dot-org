# == Schema Information
#
# Table name: metrics
#
#  id          :integer          not null, primary key
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  computed_on :date             not null
#  computed_by :string(255)      not null
#  metric_on   :date             not null
#  course      :string(255)
#  breakdown   :string(255)
#  metric      :string(255)      not null
#  submetric   :string(255)      not null
#  value       :float(24)        not null
#

class Metric < ApplicationRecord
  export_to_analytics

  data_classification(
    id: :public,
    created_at: :public,
    updated_at: :public,
    computed_on: :confidential,
    computed_by: :confidential,
    metric_on: :confidential,
    course: :confidential,
    breakdown: :confidential,
    metric: :confidential,
    submetric: :confidential,
    value: :public,
  )
end
