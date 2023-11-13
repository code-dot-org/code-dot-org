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
  belongs_to :parent_level, class_name: 'Level', optional: true
  belongs_to :child_level, class_name: 'Level', optional: true
  validates_uniqueness_of :child_level, scope: :parent_level, message: ->(plcl, _data) {"child_level #{plcl.child_level&.name&.dump} is already taken for parent_level #{plcl.parent_level&.name&.dump}"}

  default_scope {order(position: :asc)}

  VALID_KINDS = [
    CONTAINED = 'contained'.freeze,
    PROJECT_TEMPLATE = 'project_template'.freeze,
    SUBLEVEL = 'sublevel'.freeze
  ]
  validates_inclusion_of :kind, in: VALID_KINDS

  VALID_KINDS.each do |kind|
    scope kind, -> {where(kind: kind)}
  end

  validate :validate_child_level_type
  def validate_child_level_type
    if kind == CONTAINED && %w(Multi FreeResponse).exclude?(child_level.type)
      error_message = "cannot add contained level of type #{child_level.type}"
      add_child_error(error_message)
    end
    if kind == SUBLEVEL && parent_level.is_a?(BubbleChoice) && %w(BubbleChoice LevelGroup).include?(child_level.type)
      error_message = "BubbleChoice level #{parent_level.name.dump} cannot contain #{child_level.type} level #{child_level.name.dump}"
      add_child_error(error_message)
    end
    if kind == PROJECT_TEMPLATE
      add_child_error('level cannot be its own project template level') if child_level == parent_level
      add_child_error("template level type #{child_level.type} does not match level type #{parent_level.type}") unless child_level.type == parent_level.type
      if child_level.project_template_level
        add_child_error('the project template level you have selected already has its own project template level')
      end
      if parent_level.parent_levels.project_template.any?
        add_child_error('this level is already a project template level of another level')
      end
    end
  end

  # Indicate there is a problem with the child level by adding an ActiveRecord
  # error to this object. Also add the same error to the parent_level, since
  # this makes it easier to surface the error to levelbuilders in some cases.
  private def add_child_error(message)
    errors.add(:child_level_id, message)
    parent_level&.errors&.add(:child_level, message)
  end
end
