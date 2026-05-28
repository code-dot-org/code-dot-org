# == Schema Information
#
# Table name: section_hidden_stages
#
#  id         :integer          not null, primary key
#  section_id :integer          not null
#  stage_id   :integer          not null
#
# Indexes
#
#  index_section_hidden_stages_on_section_id  (section_id)
#  index_section_hidden_stages_on_stage_id    (stage_id)
#

class SectionHiddenLesson < ApplicationRecord
  export_to_analytics

  data_classification(
    id: :public,
    section_id: :public,
    stage_id: :public,
  )

  belongs_to :section, optional: true
  belongs_to :lesson, foreign_key: 'stage_id', optional: true

  self.table_name = 'section_hidden_stages'
end
