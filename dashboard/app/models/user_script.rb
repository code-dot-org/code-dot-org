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
#
# Indexes
#
#  index_user_scripts_on_script_id              (script_id)
#  index_user_scripts_on_user_id_and_script_id  (user_id,script_id) UNIQUE
#

class UserScript < ActiveRecord::Base
  belongs_to :user
  belongs_to :script

  after_update :check_plc_task_assignment_updating

  def script
    Script.get_from_cache(script_id)
  end

  def check_completed?
    # the script is completed if there are no more "progression levels" to be completed
    # (unplugged levels are not progression levels, for one)
    user.next_unpassed_progression_level(Script.get_from_cache(script_id)).nil?
  end

  def empty?
    # a user script is empty if there is no progress
    started_at.nil? && completed_at.nil? && assigned_at.nil? && last_progress_at.nil?
  end

  def check_plc_task_assignment_updating
    if self.completed_at && self.script.pd
      Plc::ScriptCompletionTask.check_for_script_completion(self)
    end
  end
end
