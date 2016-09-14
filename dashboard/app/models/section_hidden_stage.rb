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

class SectionHiddenStage < ApplicationRecord
  belongs_to :section
  belongs_to :stage
end
