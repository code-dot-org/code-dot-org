# == Schema Information
#
# Table name: hidden_stages
#
#  id         :integer          not null, primary key
#  section_id :integer
#  stage_id   :integer
#
# Indexes
#
#  index_hidden_stages_on_section_id  (section_id)
#  index_hidden_stages_on_stage_id    (stage_id)
#

require 'cdo/section_helpers'

class HiddenStage < ActiveRecord::Base
  belongs_to :section
  belongs_to :stage
end
