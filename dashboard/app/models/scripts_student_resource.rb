# == Schema Information
#
# Table name: scripts_student_resources
#
#  id          :bigint           not null, primary key
#  script_id   :integer
#  resource_id :integer
#
# Indexes
#
#  index_scripts_student_resources_on_resource_id_and_script_id  (resource_id,script_id)
#  index_scripts_student_resources_on_script_id_and_resource_id  (script_id,resource_id) UNIQUE
#
class ScriptsStudentResource < ApplicationRecord
  belongs_to :script
  belongs_to :resource
end
