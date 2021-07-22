# The LevelsWithinLevels module encapsulates all functionality related to the
# various ways we have of combining levels, including:
#
# - BubbleChoice
# - Contained Levels
# - LevelGroup
# - Project Templates
module Levels
  module LevelsWithinLevels
    extend ActiveSupport::Concern
    included do
      # Because this parent-child relationship comes in different flavors, we
      # also want to provide some scopes to make interacting with subsets of
      # relationships easier.
      module ByKindExtension
        ParentLevelsChildLevel::VALID_KINDS.each do |kind|
          define_method(kind) do
            where(parent_levels_child_levels: {kind: kind})
          end
        end
      end

      # We store parent-child relationships in a self-referential join table.
      # In order to define a has_many/through relationship in both directions,
      # we must define two separate associations to the same join table.
      has_many :levels_parent_levels,
        class_name: 'ParentLevelsChildLevel',
        foreign_key: :child_level_id
      has_many :parent_levels,
        -> {extending ByKindExtension},
        through: :levels_parent_levels,
        inverse_of: :child_levels

      has_many :levels_child_levels,
        class_name: 'ParentLevelsChildLevel',
        foreign_key: :parent_level_id
      has_many :child_levels,
        -> {extending ByKindExtension},
        through: :levels_child_levels,
        inverse_of: :parent_levels
    end

    # Returns all child levels of this level, which could include contained
    # levels, project template levels, BubbleChoice sublevels, or LevelGroup
    # sublevels.  This method may be overridden by subclasses.
    def all_child_levels
      (contained_levels + [project_template_level] - [self]).compact
    end

    # we must search recursively for child levels, because some bubble choice
    # sublevels have project template levels.
    def all_descendant_levels
      my_child_levels = all_child_levels
      child_descendant_levels = my_child_levels.
        map(&:all_descendant_levels).flatten
      my_child_levels + child_descendant_levels
    end
  end
end
