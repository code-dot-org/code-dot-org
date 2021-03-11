# == Schema Information
#
# Table name: stages_standards
#
#  stage_id    :integer          not null
#  standard_id :integer          not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_stages_standards_on_stage_id     (stage_id)
#  index_stages_standards_on_standard_id  (standard_id)
#
class LessonsStandard < ApplicationRecord
  self.table_name = 'stages_standards'

  belongs_to :lesson, foreign_key: 'stage_id'
  belongs_to :standard
end
