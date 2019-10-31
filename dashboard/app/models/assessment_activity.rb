# == Schema Information
#
# Table name: assessment_activities
#
#  id              :integer          not null, primary key
#  user_id         :integer          not null
#  level_id        :integer          not null
#  script_id       :integer          not null
#  level_source_id :integer          unsigned
#  attempt         :integer
#  test_result     :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_assessment_activities_on_user_and_level_and_script  (user_id,level_id,script_id)
#

class AssessmentActivity < ActiveRecord::Base
  belongs_to :user
  belongs_to :script
  belongs_to :level
  belongs_to :level_source
end
