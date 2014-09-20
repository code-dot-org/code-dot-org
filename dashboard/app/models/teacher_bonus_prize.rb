class TeacherBonusPrize < ActiveRecord::Base
  belongs_to :prize_provider
  belongs_to :user

  def self.assign_to_user(user, prize_provider_id)
    prize = nil
    if user.teacher_bonus_prize.present?
      raise "assign_to_user() called when teacher already has bonus prize"
    elsif !user.teacher_bonus_prize_earned
      raise "assign_to_user() called when teacher has not earned bonus prize"
    else
      prize = self.where(user_id: nil, prize_provider_id: prize_provider_id).lock(true).first
      if prize
        prize.transaction do
          user.update_attributes!(:teacher_bonus_prize_id => prize.id)
          prize.update_attributes!(:user_id => user.id)
        end
        Rails.logger.info "TBPRIZE: assign_to_user() succeeded: user_id:" + user.id.to_s + ", teacher_bonus_prize_id:" + prize.id.to_s
      end
    end
    prize
  end
end
