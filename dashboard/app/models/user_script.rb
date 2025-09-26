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
  # - if an existing record is found with a nil unit_group, and the unit has an original_unit_group,
  #   we will update that record to set the unit_group to the original_unit_group.
  # - when searching for existing records associated with the original unit group id, be sure to
  #   find any row that is migrated (original unit group) or unmigrated (nil unit group).
  #
  # TODO: TEACH-2168 once unit_group_id is a required field, remove this helper and call
  # find_or_create_by! instead.
  def self.find_and_migrate_or_create_by!(user_id:, unit:, unit_group: nil)
    unless unit_group.nil? || unit.old_professional_learning_course? || unit.cached.unit_groups.include?(unit_group)
      raise "Unit #{unit.name} must belong to Unit Group #{unit_group&.name}"
    end

    # When we find a user_script, should we migrate it to the original_unit_group?
    # 1. If the unit has no original unit group, do not migrate.
    # 2. If the unit_group provided is nil or the original unit group, we should migrate.
    # 3. If the unit_group provided is a non-original unit group, do not migrate.
    original_unit_group = unit.get_original_unit_group
    should_migrate = original_unit_group && (unit_group.nil? || unit_group == original_unit_group)

    # find
    unit_groups_to_find_by = should_migrate ? [nil, original_unit_group] : [unit_group]
    us = find_by(user_id: user_id, script: unit, unit_group: unit_groups_to_find_by)

    # migrate
    if us && us.unit_group.nil?
      us.update!(unit_group: original_unit_group)
    end

    return us if us

    # create
    unit_group_to_create = should_migrate ? original_unit_group : unit_group
    create!(user_id: user_id, script: unit, unit_group: unit_group_to_create)
  end
end
