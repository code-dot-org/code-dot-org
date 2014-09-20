class Prize < ActiveRecord::Base
  belongs_to :prize_provider
  belongs_to :user
  
  def self.assign_to_user(user, prize_provider_id)
    prize = nil
    if user.prize.present?
      raise "assign_to_user() called when user already has prize"
    elsif !user.prize_earned
      raise "assign_to_user() called when user has not earned prize"
    else
      prize = self.where(user_id: nil, prize_provider_id: prize_provider_id).lock(true).first
      if prize
        prize.transaction do
          user.update_attributes!(:prize_id => prize.id)
          prize.update_attributes!(:user_id => user.id)
        end
        Rails.logger.info "PRIZE: assign_to_user() succeeded: user_id:" + user.id.to_s + ", prize_id:" + prize.id.to_s
      end
    end
    prize
  end
end
