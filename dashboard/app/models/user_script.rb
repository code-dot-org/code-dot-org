class UserScript < ActiveRecord::Base
  belongs_to :user
  belongs_to :script

  def check_completed?
    # the script is completed if there are no more "progression levels" to be completed
    # (unplugged levels are not progression levels, for one)
    user.next_unpassed_progression_level(script).nil?
  end

  def empty?
    # a user script is empty if there is no progress
    started_at.nil? && completed_at.nil? && assigned_at.nil? && last_progress_at.nil?
  end
end
