# == Schema Information
#
# Table name: section_hidden_scripts
#
#  id         :integer          not null, primary key
#  section_id :integer          not null
#  script_id  :integer          not null
#
# Indexes
#
#  index_section_hidden_scripts_on_script_id   (script_id)
#  index_section_hidden_scripts_on_section_id  (section_id)
#

class SectionHiddenScript < ApplicationRecord
  belongs_to :section
  belongs_to :script
end
