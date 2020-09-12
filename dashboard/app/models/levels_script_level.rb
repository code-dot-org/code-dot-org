# == Schema Information
#
# Table name: levels_script_levels
#
#  level_id        :integer          not null
#  script_level_id :integer          not null
#
# Indexes
#
#  index_levels_script_levels_on_level_id                      (level_id)
#  index_levels_script_levels_on_script_level_id               (script_level_id)
#  index_levels_script_levels_on_script_level_id_and_level_id  (script_level_id,level_id) UNIQUE
#

# Join table.
# Don't add anything to this model; used for convenience for ActiveRecord Import.
class LevelsScriptLevel < ActiveRecord::Base
  belongs_to :script_level
  belongs_to :level
end
