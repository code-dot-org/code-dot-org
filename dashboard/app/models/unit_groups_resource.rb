# == Schema Information
#
# Table name: unit_groups_resources
#
#  unit_group_id :integer          not null, primary key
#  resource_id   :integer          not null, primary key
#
# Indexes
#
#  index_unit_groups_resources_on_resource_id_and_unit_group_id  (resource_id,unit_group_id)
#  index_unit_groups_resources_on_unit_group_id_and_resource_id  (unit_group_id,resource_id) UNIQUE
#
class UnitGroupsResource < ApplicationRecord
end
