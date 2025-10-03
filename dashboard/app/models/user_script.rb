# == Schema Information
#
# Table name: user_scripts
#
#  id               :integer          not null, primary key
#  user_id          :integer          not null
#  script_id        :integer          not null
#  started_at       :datetime
#  completed_at     :datetime
#  assigned_at      :datetime
#  last_progress_at :datetime
#  created_at       :datetime
#  updated_at       :datetime
#  properties       :text(65535)
#  deleted_at       :datetime
#  unit_group_id    :integer
#
# Indexes
#
#  index_user_scripts_on_script_id                              (script_id)
#  index_user_scripts_on_user_script_unit_group_deleted_unique  (user_id,script_id,unit_group_id,deleted_at) UNIQUE
#

class UserScript < ApplicationRecord
  include SerializedProperties

  acts_as_paranoid # Use deleted_at column instead of deleting rows.

  belongs_to :user
  belongs_to :script, class_name: 'Unit'
  belongs_to :unit_group, optional: true

  serialized_attrs %w(
    version_warning_dismissed
  )

  def script
    Unit.get_from_cache(script_id)
  end

  # @return [Boolean] Whether the user completed the script, e.g., if there are no more progression
  #   levels to be completed (note unplugged levels are an example of non-progress levels). Also
  #   returns false if the associated user has been soft-deleted.
  def check_completed?
    user&.completed_progression_levels?(script)
  end

  def empty?
    started_at.nil? && assigned_at.nil?
  end

  # Given a set of scripts, look up which of them a user has progress in, using a single query.
  def self.lookup_hash(for_user, script_names)
    filtered_progress = Set.new UserScript.
      joins(:script).
      where(user: for_user, scripts: {name: script_names}).
      pluck(:name)
    script_names.index_with do |name|
      filtered_progress.include?(name)
    end
  end

  # Helper method which provides find-or-create functionality, with additional logic to prevent
  # duplicate rows from being created while we work on migrating existing rows to have a
  # unit_group_id. More specifically:
  # - default unit_group to the unit's original_unit_group if not provided
  # - also find rows with nil unit_group to migrate them to unit_group
  #
  # This strategy the goals of (1) avoiding creating duplicate rows, and (2) migrating existing
  # rows to a unit_group that we know the user is engaging with (rather than guessing that it
  # should be migrated to the original unit group).
  #
  # TODO: TEACH-2168 once unit_group_id has been backfilled and has been marked as a required field,
  # remove the migration logic from this method and rename the method.
  def self.find_and_migrate_or_create_by!(user_id:, unit:, unit_group: nil)
    unless unit_group.nil? || unit.old_professional_learning_course? || unit.cached.unit_groups.include?(unit_group)
      raise "Unit #{unit.name} must belong to Unit Group #{unit_group&.name}"
    end

    # default to original unit group if none provided
    original_unit_group = unit.get_original_unit_group
    unit_group ||= original_unit_group

    # find
    unit_groups_to_find_by = [nil, unit_group]
    us = find_by(user_id: user_id, script: unit, unit_group: unit_groups_to_find_by)

    # migrate
    if us && us.unit_group.nil?
      us.update!(unit_group: unit_group)
    end

    return us if us

    # create
    create!(user_id: user_id, script: unit, unit_group: unit_group)
  end
end
