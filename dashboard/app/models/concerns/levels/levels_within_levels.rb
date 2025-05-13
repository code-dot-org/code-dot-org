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
        dependent: :restrict_with_error,
        inverse_of: :child_levels,
        through: :levels_parent_levels

      has_many :levels_child_levels,
        class_name: 'ParentLevelsChildLevel',
        dependent: :destroy,
        foreign_key: :parent_level_id
      has_many :child_levels,
        -> {extending ByKindExtension},
        inverse_of: :parent_levels,
        through: :levels_child_levels

      before_validation :sanitize_contained_level_names
      after_save :setup_contained_levels
      after_save :setup_project_template_level
    end

    class_methods do
      # Helper method for level cloning, called by `clone_with_suffix`; given a
      # level, create clones of all its children. Returns a hash of all
      # parameters on that level that need to be updated in response.
      def clone_child_levels(parent_level, new_suffix, editor_experiment: nil)
        update_params = {}
        parent_level.levels_child_levels.each do |parent_levels_child_level|
          child_level = parent_levels_child_level.child_level
          cloned_child_level = child_level.
            clone_with_suffix(new_suffix, editor_experiment: editor_experiment)
          parent_levels_child_level.child_level = cloned_child_level
          parent_levels_child_level.save!
        end

        if parent_level.child_levels.contained.present?
          update_params[:contained_level_names] =
            parent_level.child_levels.contained.map(&:name)
        end

        if parent_level.child_levels.project_template.present?
          update_params[:project_template_level_name] =
            parent_level.child_levels.project_template.first.name
        end

        return update_params
      end

      # Create ParentLevelsChildLevel many-to-many relationships based on the
      # contents of the specified levels' `contained_level_names` or `project_template_level_name` properties.
      # Differentiated by child_level_kind (either ParentLevelsChildLevel::CONTAINED or ParentLevelsChildLevel::PROJECT_TEMPLATE)
      def setup_child_levels_for(levels, child_level_kind)
        outdated_levels_child_level_ids = []
        new_levels_child_levels = []

        levels.each do |level|
          # Determine which level names to use based on child_level_kind
          child_level_names = child_level_kind == ParentLevelsChildLevel::CONTAINED ? level.contained_level_names : [level.project_template_level_name]
          # Skip if the current level's child levels already match the names
          next if level.child_levels.send(child_level_kind).map(&:name) == child_level_names

          # Collect outdated child levels' ids
          outdated_levels_child_level_ids += level.levels_child_levels.send(child_level_kind).ids

          next if child_level_names.blank?

          # Create new relationships for matching names
          Level.where(name: child_level_names).find_each do |child_level|
            position = child_level_names.index(child_level.name) if child_level_kind == ParentLevelsChildLevel::CONTAINED
            new_levels_child_levels << ParentLevelsChildLevel.new(
              parent_level: level,
              child_level: child_level,
              kind: child_level_kind,
              position: position
            )
          end
        end

        # Delete outdated child levels in batches
        outdated_levels_child_level_ids.each_slice(1000) do |ids_batch|
          ParentLevelsChildLevel.where(id: ids_batch).delete_all
        end

        # Insert new child level relationships in batches
        ParentLevelsChildLevel.import!(new_levels_child_levels, batch_size: 1000) if new_levels_child_levels.any?

        # Reset child level caches for each level
        levels.each do |level|
          level.levels_child_levels.reset
          level.child_levels.reset
        end
      end
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
      Rails.cache.fetch(cache_key, force: !Unit.should_cache?) do
        result = child_levels.contained

        # attempt to use the new parent-child many-to-many table to retrieve the
        # levels themselves, but if we have a contained_level_names property and
        # no actual associations, fall back to retrieving the levels directly.
        # Once the new m2m implementation has been fully deployed, we can remove
        # this fallback.
        if result.blank?
          result = contained_level_names.map do |contained_level_name|
            Unit.cache_find_level(contained_level_name)
          end
        end

        return result
      end
    end

    # Project template levels are used to persist use progress across multiple
    # levels, using a single level name as the storage key for that user.
    def project_template_level
      return nil if try(:project_template_level_name).nil?
      cache_key = "LevelsWithinLevels/project_template/#{project_template_level_name}"
      Rails.cache.fetch(cache_key, force: !Unit.should_cache?) do
        # attempt to use the new parent-child many-to-many table to retrieve
        # the level, but if we have a project_template_level_name property and
        # no actual association, fall back to retrieving the level directly.
        # Once the new m2m implementation has been fully deployed, we can
        # remove this fallback.
        return (child_levels.project_template.first ||
                Level.find_by_key(project_template_level_name))
      end
    end

    def host_level
      project_template_level || self
    end

    def sanitize_contained_level_names
      contained_level_names = properties["contained_level_names"]
      contained_level_names.try(:delete_if, &:blank?)
      contained_level_names = nil unless contained_level_names.try(:present?)
      properties["contained_level_names"] = contained_level_names
    end

    def setup_contained_levels
      self.class.setup_child_levels_for([self], ParentLevelsChildLevel::CONTAINED)
    end

    def setup_project_template_level
      self.class.setup_child_levels_for([self], ParentLevelsChildLevel::PROJECT_TEMPLATE)
    end
  end
end
