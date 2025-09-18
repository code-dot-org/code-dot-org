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

  # Find a UserScript for the given user and unit, ignoring any with non-original unit groups.
  # If the found row has no Unit Group, migrate it to have the unit's original Unit Group.
  #
  # @param user [User] the user
  # @param unit [Unit] the unit
  def self.find_and_migrate_by(user:, unit:)
    original_unit_group = unit.get_original_unit_group
    user_script = find_by(user: user, script: unit, unit_group: [nil, original_unit_group])
    return nil unless user_script

    # If we found a UserScript with no unit group, and the unit's original unit group is not nil,
    # migrate the UserScript to have that unit group.
    user_script.unit_group = original_unit_group
    user_script.save! if user_script.unit_group_id_changed?
    user_script
  end

  def self.find_and_migrate_or_create_by!(user:, unit:, unit_group: nil)
    unless unit_group.nil? || unit.cached.unit_groups.include?(unit_group)
      raise "Unit #{unit.name} must belong to Unit Group #{unit_group&.name}"
    end
    original_unit_group = unit.get_original_unit_group

    # skip all migration logic if we're looking for a UserScript for a non-original unit group, or
    # if the unit has no original unit group.
    has_non_original_unit_group = unit_group && unit_group != original_unit_group
    if has_non_original_unit_group || original_unit_group.nil?
      return find_or_create_by!(user: user, script: unit, unit_group: unit_group)
    end

    # the unit has an original unit group, and we're looking for a UserScript with the original
    # unit group or no unit group.
    user_script = find_and_migrate_by(user: user, unit: unit)
    return user_script if user_script

    # No existing UserScript found, so create one with the original unit group.
    create!(user: user, script: unit, unit_group: original_unit_group)
  end
end
