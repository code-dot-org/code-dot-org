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

      before_validation :sanitize_contained_level_names
      after_save :setup_contained_levels
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

    # Helper method for retrieving contained levels; primarily exists to
    # provide caching
    def contained_levels
      return [] if contained_level_names.blank?
      cache_key = "LevelsWithinLevels/contained/#{contained_level_names&.join('/')}"
      Rails.cache.fetch(cache_key, force: !Script.should_cache?) do
        child_levels.contained
      end
    end

    # Helper method for level cloning, called by `clone_with_suffix`; given a
    # freshly-cloned level, create clones of all its children.
    #
    # Returns a hash of all parameters on that level that need to be updated in
    # response.
    def self.clone_child_levels(new_cloned_level, new_suffix, editor_experiment: nil)
      update_params = {}
      new_cloned_level.levels_child_levels.each do |parent_levels_child_level|
        child_level = parent_levels_child_level.child_level
        cloned_child_level = child_level.
          clone_with_suffix(new_suffix, editor_experiment: editor_experiment)
        parent_levels_child_level.child_level = cloned_child_level
        parent_levels_child_level.save!
      end

      unless new_cloned_level.child_levels.contained.empty?
        update_params[:contained_level_names] =
          new_cloned_level.child_levels.contained.map(&:name)
      end

      return update_params
    end

    private

    def sanitize_contained_level_names
      contained_level_names = properties["contained_level_names"]
      contained_level_names.try(:delete_if, &:blank?)
      contained_level_names = nil unless contained_level_names.try(:present?)
      properties["contained_level_names"] = contained_level_names
    end

    # Create ParentLevelsChildLevel many-to-many relationships based on the
    # contents of this level's `contained_level_names` property.
    def setup_contained_levels
      # if our existing contained levels already match the given names, do
      # nothing
      return if child_levels.contained.map(&:name) == contained_level_names

      # otherwise, update contained levels to match; destroy any existing
      # relations to levels NOT in the given names, and create/update relations
      # to the levels we want.
      new_contained_levels = Level.where(name: contained_level_names)

      levels_child_levels.
        contained.
        where.not(child_level: new_contained_levels).
        destroy_all

      new_contained_levels.each do |new_contained_level|
        relation = levels_child_levels.
          where(child_level: new_contained_level).
          first_or_initialize
        relation.kind = ParentLevelsChildLevel::CONTAINED
        relation.position = contained_level_names.index(new_contained_level.name)
        relation.save!
      end
    end
  end
end
