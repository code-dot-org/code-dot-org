# Records a User's number of attempts and best completion result for specific Levels
class UserLevel < ActiveRecord::Base
  belongs_to :user
  belongs_to :level

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
