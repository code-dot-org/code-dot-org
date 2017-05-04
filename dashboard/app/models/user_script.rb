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

  def script
    Script.get_from_cache(script_id)
  end

  def check_completed?
    # the script is completed if there are no more "progression levels" to be completed
    # (unplugged levels are not progression levels, for one)
    user.completed_progression_levels? script
  end

  def empty?
    started_at.nil? && assigned_at.nil?
  end
end
