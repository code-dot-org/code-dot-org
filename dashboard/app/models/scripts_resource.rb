# == Schema Information
#
# Table name: scripts_resources
#
#  script_id   :integer
#  resource_id :integer
#
# Indexes
#
#  index_scripts_resources_on_resource_id_and_script_id  (resource_id,script_id)
#  index_scripts_resources_on_script_id_and_resource_id  (script_id,resource_id) UNIQUE
#
class ScriptsResource < ApplicationRecord
  belongs_to :resource
  belongs_to :script
end
