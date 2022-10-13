# == Schema Information
#
# Table name: assessment_activities
#
#  id              :integer          not null, primary key
#  user_id         :integer          not null
#  level_id        :integer          not null
#  script_id       :integer          not null
#  level_source_id :bigint           unsigned
#  attempt         :integer
#  test_result     :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_assessment_activities_on_user_and_level_and_script  (user_id,level_id,script_id)
#

class AssessmentActivity < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :script, optional: true
  belongs_to :level, optional: true
  belongs_to :level_source, optional: true
end
