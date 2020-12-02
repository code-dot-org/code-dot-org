# == Schema Information
#
# Table name: parent_levels_child_levels
#
#  id              :integer          not null, primary key
#  parent_level_id :integer          not null
#  child_level_id  :integer          not null
#  position        :integer
#  kind            :string(255)      default("sublevel"), not null
#
# Indexes
#
#  index_parent_levels_child_levels_on_child_level_id   (child_level_id)
#  index_parent_levels_child_levels_on_parent_level_id  (parent_level_id)
#

# This class allows a level to store an ordered list of child levels. Each
# instance of this class represents an individual parent-child relationship
# between a pair of levels. Initially, this functionality will be used to
# represent sublevels within LevelGroup, BubbleChoice, and Lesson Extras levels.
#
# The number of columns on this model's table should be few as possible, and
# should not be specific to the kind of parent-child relationship or to the
# parent level type. Ideally, we would only ever add the following two columns
# to this model:
#
# 1. the `kind` column, in order to support contained levels and project
# template levels
#
# 2. a `properties` column, which the parent level would need to know how to
# managed, based on its level type and this model's `kind`
#
# For design details, see:
# https://docs.google.com/document/d/10mqXBdkFo5nWhjGWJO6D_NMl4Qg74qb7P6Fdvb2P7sc/edit?usp=sharing
#
class ParentLevelsChildLevel < ApplicationRecord
  belongs_to :parent_level, class_name: 'Level'
  belongs_to :child_level, class_name: 'Level'
  validates_uniqueness_of :child_level, scope: :parent_level

  VALID_KINDS = [
    CONTAINED = 'contained'.freeze,
    PROJECT_TEMPLATE = 'project_template'.freeze,
    SUBLEVEL = 'sublevel'.freeze
  ]
  validates_inclusion_of :kind, in: VALID_KINDS
end
