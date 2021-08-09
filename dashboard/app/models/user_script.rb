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
#
# Indexes
#
#  index_user_scripts_on_script_id              (script_id)
#  index_user_scripts_on_user_id_and_script_id  (user_id,script_id) UNIQUE
#

class UserScript < ApplicationRecord
  include SerializedProperties

  belongs_to :user
  belongs_to :script

  validates_presence_of :user, :script

  serialized_attrs %w(
    version_warning_dismissed
  )

  def script
    Script.get_from_cache(script_id)
  end

  # @return [Boolean] Whether the user completed the script, e.g., if there are no more progression
  #   levels to be completed (note unplugged levels are an example of non-progress levels). Also
  #   returns false if the associated user has been soft-deleted.
  def check_completed?
    user && user.completed_progression_levels?(script)
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
    script_names.map do |name|
      [name, filtered_progress.include?(name)]
    end.to_h
  end
end
