# == Schema Information
#
# Table name: unit_groups_student_resources
#
#  id            :bigint           not null, primary key
#  unit_group_id :integer
#  resource_id   :integer
#
# Indexes
#
#  index_ug_student_resources_on_resource_id_and_unit_group_id  (resource_id,unit_group_id)
#  index_ug_student_resources_on_unit_group_id_and_resource_id  (unit_group_id,resource_id) UNIQUE
#
class UnitGroupsStudentResource < ApplicationRecord
  belongs_to :unit_group
  belongs_to :resource
end
