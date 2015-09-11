# == Schema Information
#
# Table name: user_levels
#
#  id              :integer          not null, primary key
#  user_id         :integer          not null
#  level_id        :integer          not null
#  attempts        :integer          default(0), not null
#  created_at      :datetime
#  updated_at      :datetime
#  best_result     :integer
#  script_id       :integer
#  level_source_id :integer
#
# Indexes
#
#  index_user_levels_on_user_id_and_level_id_and_script_id  (user_id,level_id,script_id) UNIQUE
#

# Records a User's number of attempts and best completion result for specific Levels
class UserLevel < ActiveRecord::Base
  belongs_to :user
  belongs_to :level
  belongs_to :script

  def best?
    Activity.best? best_result
  end

  def finished?
    Activity.finished? best_result
  end

  def passing?
    Activity.passing? best_result
  end
end
