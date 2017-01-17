# == Schema Information
#
# Table name: teacher_prizes
#
#  id                :integer          not null, primary key
#  prize_provider_id :integer          not null
#  code              :string(255)      not null
#  user_id           :integer
#  created_at        :datetime
#  updated_at        :datetime
#
# Indexes
#
#  index_teacher_prizes_on_prize_provider_id  (prize_provider_id)
#  index_teacher_prizes_on_user_id            (user_id)
#

class TeacherPrize < ActiveRecord::Base
  belongs_to :prize_provider
  belongs_to :user

  def self.assign_to_user(user, prize_provider_id)
    prize = nil
    if user.teacher_prize.present?
      raise "assign_to_user() called when teacher already has prize"
    elsif !user.teacher_prize_earned
      raise "assign_to_user() called when teacher has not earned prize"
    else
      prize = where(user_id: nil, prize_provider_id: prize_provider_id).lock(true).first
      if prize
        prize.transaction do
          user.update_attributes!(teacher_prize_id: prize.id)
          prize.update_attributes!(user_id: user.id)
        end
        Rails.logger.info "TPRIZE: assign_to_user() succeeded: user_id:" + user.id.to_s + ", teacher_prize_id:" + prize.id.to_s
      end
    end
    prize
  end
end
